import type {
  CompanionMessage,
  CompanionRecommendation,
  CompanionReportContext,
  CompanionSessionContext,
  RequestedField,
  SourceMode,
} from '../companion/domain/companion.types';

export type CompanionChatRequest = {
  sessionId: string;
  reportContext: {
    reportId?: string;
    zipCode: string;
    city?: string;
    county?: string;
    state?: string;
    stormScore: number;
    riskLevel: string;
    hurricaneScore: number;
    floodScore: number;
    coastalScore: number;
    lat?: number;
    lon?: number;
  };
  evidenceContext?: {
    verifiedSignal?: {
      title?: string;
      description?: string;
      source?: string;
      status?: string;
      headline?: {
        title?: string;
        source?: string;
        publishedAt?: string;
        severity?: string;
        url?: string;
      } | null;
    };
    windMap?: {
      title?: string;
      description?: string;
      source?: string;
      status?: string;
    };
    floodMap?: {
      title?: string;
      description?: string;
      source?: string;
      status?: string;
    };
  };
  personalization?: {
    exactAddress?: string;
    roofType?: string;
    yearBuilt?: string;
    damageHistory?: string[];
    userGoal?: string;
    completionScore?: number;
  };
  recommendation?: {
    inspectionType?: string;
    urgency?: string;
    rationale?: string;
  };
  sourceMode: SourceMode;
  activeStage: string;
  messageHistory: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  userMessage: string;
};

export type CompanionChatResponse = {
  assistantMessage: string;
  responseMode: 'explain' | 'clarify' | 'personalize' | 'recommend' | 'handoff';
  suggestedReplies: string[];
  requestedField?: RequestedField | null;
  showRecommendation?: boolean;
  showBookingCTA?: boolean;
};

export type CompanionInterpretationPayload = {
  stage: 'interpret_report' | 'personalize_property' | 'recommend_action' | 'live_intelligence';
  sourceMode: SourceMode;
  userMessage: CompanionMessage;
  assistantMessage: CompanionMessage;
  suggestedPrompts: string[];
  requestedFields?: RequestedField[];
  personalization?: Partial<CompanionSessionContext['personalization']>;
  recommendation?: CompanionRecommendation;
  cta?: CompanionSessionContext['activeCTA'];
};

function buildMessageHistory(messages: CompanionMessage[]) {
  return messages
    .filter((message) => message.text.trim())
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.text.trim().slice(0, 280),
    }));
}

function buildEvidenceContext(reportContext: CompanionReportContext) {
  const snapshot = reportContext.evidenceSnapshot;
  if (!snapshot) {
    return undefined;
  }

  const [signalCard, windCard, floodCard] = snapshot.cards;

  return {
    verifiedSignal: signalCard
      ? {
          title: signalCard.title,
          description: signalCard.description,
          source: signalCard.source,
          status: signalCard.status,
          headline: signalCard.headline
            ? {
                title: signalCard.headline.title,
                source: signalCard.headline.source,
                publishedAt: signalCard.headline.publishedAt,
                severity: signalCard.headline.severity,
                url: signalCard.headline.url,
              }
            : null,
        }
      : undefined,
    windMap: windCard
      ? {
          title: windCard.title,
          description: windCard.description,
          source: windCard.source,
          status: windCard.status,
        }
      : undefined,
    floodMap: floodCard
      ? {
          title: floodCard.title,
          description: floodCard.description,
          source: floodCard.source,
          status: floodCard.status,
        }
      : undefined,
  };
}

export function buildCompanionChatRequest(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext,
  userMessage: string
): CompanionChatRequest {
  return {
    sessionId: reportContext.reportId || `zip-${reportContext.zipCode}`,
    reportContext: {
      reportId: reportContext.reportId,
      zipCode: reportContext.zipCode,
      city: reportContext.city,
      county: reportContext.county,
      state: reportContext.state,
      stormScore: reportContext.stormScore,
      riskLevel: reportContext.riskLevel,
      hurricaneScore: reportContext.hurricaneScore,
      floodScore: reportContext.floodScore,
      coastalScore: reportContext.coastalScore,
      lat: reportContext.lat,
      lon: reportContext.lon,
    },
    evidenceContext: buildEvidenceContext(reportContext),
    personalization: sessionContext.personalization,
    recommendation: sessionContext.recommendation,
    sourceMode: sessionContext.sourceMode,
    activeStage: sessionContext.activeStage,
    messageHistory: buildMessageHistory(sessionContext.messages),
    userMessage,
  };
}

export async function fetchCompanionChatResponse(
  payload: CompanionChatRequest
): Promise<CompanionChatResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = `${supabaseUrl}/functions/v1/companion-chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Companion chat request failed: ${errorText}`);
  }

  return response.json();
}
