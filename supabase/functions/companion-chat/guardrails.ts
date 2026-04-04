import type { CompanionChatRequest, CompanionChatResponse } from "./types.ts";

type GuardrailResult = {
  response: CompanionChatResponse;
  triggeredRules: string[];
};

function safeFallbackForScope(): CompanionChatResponse {
  return {
    assistantMessage:
      "I can help explain the report and what inspection may be useful next, but I can't confirm property-level damage or exact structural conditions from ZIP-level report data alone.",
    responseMode: "clarify",
    suggestedReplies: [
      "What does this report mean?",
      "What should I do next?",
      "Why would an inspection help?",
    ],
    requestedField: null,
    showRecommendation: false,
    showBookingCTA: false,
  };
}

function hasPropertyContext(payload: CompanionChatRequest) {
  return Boolean(payload.personalization?.exactAddress);
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function softenPrecisionClaims(text: string, payload: CompanionChatRequest) {
  let next = text;

  if (!hasPropertyContext(payload)) {
    next = next
      .replaceAll(/\byour property\b/gi, "the property")
      .replaceAll(/\byour home\b/gi, "the home")
      .replaceAll(/\byour house\b/gi, "the home");
  }

  next = next
    .replaceAll(/\bexact for your property\b/gi, "specific to your property")
    .replaceAll(/\bexact for your home\b/gi, "specific to your home")
    .replaceAll(/\bprecise diagnosis\b/gi, "property-level diagnosis");

  return normalizeWhitespace(next);
}

function containsDisallowedDamageDiagnosis(text: string) {
  const haystack = text.toLowerCase();
  return [
    "your roof is damaged",
    "your property is damaged",
    "your home is damaged",
    "your house is damaged",
    "you have roof damage",
    "you have structural damage",
    "your roof has damage",
    "your home has structural issues",
    "this confirms damage",
    "this confirms roof damage",
  ].some((phrase) => haystack.includes(phrase));
}

function containsFalsePrecisionClaim(text: string) {
  const haystack = text.toLowerCase();
  return [
    "this is exact for your property",
    "this is exact for your home",
    "this is precise for your home",
    "this is a diagnosis of your home",
    "this confirms the condition of your home",
  ].some((phrase) => haystack.includes(phrase));
}

function clampSuggestedReplies(replies: string[]) {
  return replies
    .map((reply) => normalizeWhitespace(reply))
    .filter(Boolean)
    .slice(0, 3);
}

export function applyGuardrails(
  payload: CompanionChatRequest,
  modelResponse: CompanionChatResponse,
): GuardrailResult {
  const triggeredRules: string[] = [];
  let response = {
    ...modelResponse,
    assistantMessage: normalizeWhitespace(modelResponse.assistantMessage),
    suggestedReplies: clampSuggestedReplies(modelResponse.suggestedReplies),
  };

  if (!response.assistantMessage) {
    triggeredRules.push("empty_message");
    response = safeFallbackForScope();
  }

  if (containsDisallowedDamageDiagnosis(response.assistantMessage)) {
    triggeredRules.push("damage_diagnosis");
    response = safeFallbackForScope();
  }

  if (containsFalsePrecisionClaim(response.assistantMessage)) {
    triggeredRules.push("false_precision");
    response = safeFallbackForScope();
  }

  const softened = softenPrecisionClaims(response.assistantMessage, payload);
  if (softened !== response.assistantMessage) {
    triggeredRules.push("softened_precision_language");
    response = {
      ...response,
      assistantMessage: softened,
    };
  }

  if (response.showBookingCTA && !response.showRecommendation && !payload.recommendation?.inspectionType) {
    triggeredRules.push("booking_without_recommendation");
    response = {
      ...response,
      showBookingCTA: false,
    };
  }

  return {
    response,
    triggeredRules,
  };
}
