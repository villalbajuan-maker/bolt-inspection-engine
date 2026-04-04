import type {
  CompanionChatRequest,
  CompanionChatResponse,
  CompanionMessageHistoryItem,
  CompanionRequestedField,
  CompanionResponseMode,
} from "./types.ts";
import { buildConversationHistory } from "./context.ts";
import { applyGuardrails } from "./guardrails.ts";
import { buildSystemPrompt } from "./prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";

type OpenAIChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function fallbackResponse(): CompanionChatResponse {
  return {
    assistantMessage:
      "I can still help explain the report, but I couldn't process that question right now. Try asking what the score means, what matters most here, or what inspection makes sense next.",
    responseMode: "clarify",
    suggestedReplies: [
      "What does this score mean?",
      "What matters most in this report?",
      "What should I do next?",
    ],
    requestedField: null,
    showRecommendation: false,
    showBookingCTA: false,
  };
}

function normalizeSuggestedReplies(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeRequestedField(value: unknown): CompanionRequestedField | null {
  const allowed: CompanionRequestedField[] = [
    "exactAddress",
    "roofType",
    "yearBuilt",
    "damageHistory",
    "userGoal",
  ];

  return typeof value === "string" && allowed.includes(value as CompanionRequestedField)
    ? (value as CompanionRequestedField)
    : null;
}

function normalizeResponseMode(value: unknown): CompanionResponseMode {
  const allowed: CompanionResponseMode[] = [
    "explain",
    "clarify",
    "personalize",
    "recommend",
    "handoff",
  ];

  return typeof value === "string" && allowed.includes(value as CompanionResponseMode)
    ? (value as CompanionResponseMode)
    : "clarify";
}

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

function normalizeModelResponse(rawContent: string): CompanionChatResponse {
  const extracted = extractJsonObject(rawContent);
  if (!extracted) {
    return fallbackResponse();
  }

  try {
    const parsed = JSON.parse(extracted);
    const assistantMessage =
      typeof parsed.assistantMessage === "string" && parsed.assistantMessage.trim()
        ? parsed.assistantMessage.trim()
        : fallbackResponse().assistantMessage;

    return {
      assistantMessage,
      responseMode: normalizeResponseMode(parsed.responseMode),
      suggestedReplies: normalizeSuggestedReplies(parsed.suggestedReplies),
      requestedField: normalizeRequestedField(parsed.requestedField),
      showRecommendation: Boolean(parsed.showRecommendation),
      showBookingCTA: Boolean(parsed.showBookingCTA),
    };
  } catch (_error) {
    return fallbackResponse();
  }
}

function isValidHistoryItem(item: unknown): item is CompanionMessageHistoryItem {
  if (!item || typeof item !== "object") return false;

  const candidate = item as Record<string, unknown>;
  return (
    (candidate.role === "system" ||
      candidate.role === "user" ||
      candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

function parseRequestBody(body: unknown): CompanionChatRequest | null {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Record<string, unknown>;
  const reportContext = candidate.reportContext as Record<string, unknown> | undefined;
  const messageHistory = Array.isArray(candidate.messageHistory)
    ? candidate.messageHistory.filter(isValidHistoryItem)
    : [];

  if (
    typeof candidate.sessionId !== "string" ||
    !candidate.sessionId.trim() ||
    !reportContext ||
    typeof reportContext.zipCode !== "string" ||
    typeof reportContext.stormScore !== "number" ||
    typeof reportContext.riskLevel !== "string" ||
    typeof reportContext.hurricaneScore !== "number" ||
    typeof reportContext.floodScore !== "number" ||
    typeof reportContext.coastalScore !== "number" ||
    typeof candidate.userMessage !== "string" ||
    !candidate.userMessage.trim() ||
    (candidate.sourceMode !== "report" &&
      candidate.sourceMode !== "personalized" &&
      candidate.sourceMode !== "live") ||
    typeof candidate.activeStage !== "string"
  ) {
    return null;
  }

  return {
    sessionId: candidate.sessionId,
    reportContext: {
      reportId: typeof reportContext.reportId === "string" ? reportContext.reportId : undefined,
      zipCode: reportContext.zipCode,
      city: typeof reportContext.city === "string" ? reportContext.city : undefined,
      county: typeof reportContext.county === "string" ? reportContext.county : undefined,
      state: typeof reportContext.state === "string" ? reportContext.state : undefined,
      stormScore: reportContext.stormScore,
      riskLevel: reportContext.riskLevel,
      hurricaneScore: reportContext.hurricaneScore,
      floodScore: reportContext.floodScore,
      coastalScore: reportContext.coastalScore,
      lat: typeof reportContext.lat === "number" ? reportContext.lat : undefined,
      lon: typeof reportContext.lon === "number" ? reportContext.lon : undefined,
    },
    technicalContext:
      candidate.technicalContext && typeof candidate.technicalContext === "object"
        ? (candidate.technicalContext as CompanionChatRequest["technicalContext"])
        : undefined,
    evidenceContext:
      candidate.evidenceContext && typeof candidate.evidenceContext === "object"
        ? (candidate.evidenceContext as CompanionChatRequest["evidenceContext"])
        : undefined,
    personalization:
      candidate.personalization && typeof candidate.personalization === "object"
        ? (candidate.personalization as CompanionChatRequest["personalization"])
        : undefined,
    recommendation:
      candidate.recommendation && typeof candidate.recommendation === "object"
        ? (candidate.recommendation as CompanionChatRequest["recommendation"])
        : undefined,
    sourceMode: candidate.sourceMode,
    activeStage: candidate.activeStage,
    messageHistory: buildConversationHistory(messageHistory),
    userMessage: candidate.userMessage.trim(),
  };
}

async function callOpenAI(payload: CompanionChatRequest): Promise<CompanionChatResponse> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(payload),
        },
        ...payload.messageHistory.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        {
          role: "user",
          content: payload.userMessage,
        },
      ],
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data: OpenAIChatCompletionResponse = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("OpenAI response did not include message content");
  }

  return normalizeModelResponse(rawContent);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const payload = parseRequestBody(body);

    if (!payload) {
      return jsonResponse(
        {
          error: "Invalid request payload",
          required: ["sessionId", "reportContext", "sourceMode", "activeStage", "userMessage"],
        },
        400,
      );
    }

    const assistantResponse = await callOpenAI(payload);
    const guarded = applyGuardrails(payload, assistantResponse);

    if (guarded.triggeredRules.length > 0) {
      console.warn("[companion-chat] Guardrails triggered:", guarded.triggeredRules);
    }

    return jsonResponse(guarded.response);
  } catch (error) {
    console.error("[companion-chat] Error:", error);
    return jsonResponse(fallbackResponse(), 200);
  }
});
