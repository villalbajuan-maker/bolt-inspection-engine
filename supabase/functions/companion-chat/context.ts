import type { CompanionChatRequest, CompanionMessageHistoryItem } from "./types.ts";

const MAX_HISTORY_ITEMS = 6;
const MAX_HISTORY_MESSAGE_LENGTH = 280;

function formatValue(label: string, value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") return null;
  return `- ${label}: ${value}`;
}

function buildReportContextText(payload: CompanionChatRequest) {
  const { reportContext } = payload;
  return [
    "Report context:",
    formatValue("reportId", reportContext.reportId),
    formatValue("zipCode", reportContext.zipCode),
    formatValue("city", reportContext.city),
    formatValue("county", reportContext.county),
    formatValue("state", reportContext.state),
    formatValue("stormScore", reportContext.stormScore),
    formatValue("riskLevel", reportContext.riskLevel),
    formatValue("hurricaneScore", reportContext.hurricaneScore),
    formatValue("floodScore", reportContext.floodScore),
    formatValue("coastalScore", reportContext.coastalScore),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildTechnicalContextText(payload: CompanionChatRequest) {
  if (!payload.technicalContext) {
    return "Technical context:\n- No technical context provided.";
  }

  const { technicalContext } = payload;
  return [
    "Technical context:",
    formatValue("distanceToCoastScore", technicalContext.distanceToCoastScore),
    formatValue("femaFloodZoneScore", technicalContext.femaFloodZoneScore),
    formatValue("hurricaneCorridorScore", technicalContext.hurricaneCorridorScore),
    formatValue("lat", payload.reportContext.lat),
    formatValue("lon", payload.reportContext.lon),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildEvidenceContextText(payload: CompanionChatRequest) {
  if (!payload.evidenceContext) {
    return "Evidence context:\n- No evidence context provided.";
  }

  const parts: string[] = ["Evidence context:"];
  const { verifiedSignal, windMap, floodMap } = payload.evidenceContext;

  if (verifiedSignal) {
    parts.push(formatValue("verifiedSignal.title", verifiedSignal.headline?.title || verifiedSignal.title) || "");
    parts.push(formatValue("verifiedSignal.source", verifiedSignal.headline?.source || verifiedSignal.source) || "");
    parts.push(formatValue("verifiedSignal.status", verifiedSignal.status) || "");
    parts.push(formatValue("verifiedSignal.publishedAt", verifiedSignal.headline?.publishedAt) || "");
    parts.push(formatValue("verifiedSignal.severity", verifiedSignal.headline?.severity) || "");
    parts.push(formatValue("verifiedSignal.description", verifiedSignal.description) || "");
  }

  if (windMap) {
    parts.push(formatValue("windContext.title", windMap.title) || "");
    parts.push(formatValue("windContext.source", windMap.source) || "");
    parts.push(formatValue("windContext.description", windMap.description) || "");
  }

  if (floodMap) {
    parts.push(formatValue("floodContext.title", floodMap.title) || "");
    parts.push(formatValue("floodContext.source", floodMap.source) || "");
    parts.push(formatValue("floodContext.description", floodMap.description) || "");
  }

  if (parts.length === 1) {
    parts.push("- No evidence context provided.");
  }

  return parts.filter(Boolean).join("\n");
}

function buildPersonalizationContextText(payload: CompanionChatRequest) {
  if (!payload.personalization) {
    return "Personalization context:\n- No personalization provided.";
  }

  const { personalization } = payload;
  return [
    "Personalization context:",
    formatValue("exactAddress", personalization.exactAddress),
    formatValue("roofType", personalization.roofType),
    formatValue("yearBuilt", personalization.yearBuilt),
    formatValue("damageHistory", personalization.damageHistory?.join(", ")),
    formatValue("userGoal", personalization.userGoal),
    formatValue("completionScore", personalization.completionScore),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildRecommendationContextText(payload: CompanionChatRequest) {
  if (!payload.recommendation) {
    return "Recommendation context:\n- No recommendation generated yet.";
  }

  const { recommendation } = payload;
  return [
    "Recommendation context:",
    formatValue("inspectionType", recommendation.inspectionType),
    formatValue("urgency", recommendation.urgency),
    formatValue("rationale", recommendation.rationale),
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildContextBlock(payload: CompanionChatRequest) {
  return [
    buildReportContextText(payload),
    buildTechnicalContextText(payload),
    buildEvidenceContextText(payload),
    buildPersonalizationContextText(payload),
    buildRecommendationContextText(payload),
    buildConversationMemoryText(payload.messageHistory),
    [
      "Product mode context:",
      formatValue("sourceMode", payload.sourceMode),
      formatValue("activeStage", payload.activeStage),
    ]
      .filter(Boolean)
      .join("\n"),
  ].join("\n\n");
}

function summarizeHistoryItems(
  history: CompanionMessageHistoryItem[],
  role: "user" | "assistant",
  limit: number,
) {
  return history
    .filter((message) => message.role === role)
    .slice(-limit)
    .map((message) => message.content.trim())
    .filter(Boolean);
}

function buildConversationMemoryText(history: CompanionMessageHistoryItem[]) {
  if (!history.length) {
    return "Conversation memory:\n- No prior conversation turns available.";
  }

  const recentUserIntents = summarizeHistoryItems(history, "user", 2);
  const recentAssistantResponses = summarizeHistoryItems(history, "assistant", 2);

  const parts = [
    "Conversation memory:",
    ...recentUserIntents.map((item, index) => `- recentUserIntent${index + 1}: ${item}`),
    ...recentAssistantResponses.map((item, index) => `- recentAssistantReply${index + 1}: ${item}`),
  ];

  return parts.join("\n");
}

export function buildConversationHistory(history: CompanionMessageHistoryItem[]) {
  return history
    .filter((message) => message.content?.trim())
    .slice(-MAX_HISTORY_ITEMS)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH),
    }));
}
