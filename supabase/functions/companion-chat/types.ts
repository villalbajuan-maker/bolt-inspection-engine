export type CompanionRequestedField =
  | "exactAddress"
  | "roofType"
  | "yearBuilt"
  | "damageHistory"
  | "userGoal";

export type CompanionResponseMode =
  | "explain"
  | "clarify"
  | "personalize"
  | "recommend"
  | "handoff";

export type CompanionMessageHistoryItem = {
  role: "system" | "user" | "assistant";
  content: string;
};

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
  technicalContext?: {
    distanceToCoastScore?: number;
    femaFloodZoneScore?: number;
    hurricaneCorridorScore?: number;
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
  sourceMode: "report" | "personalized" | "live";
  activeStage: string;
  messageHistory: CompanionMessageHistoryItem[];
  userMessage: string;
};

export type CompanionChatResponse = {
  assistantMessage: string;
  responseMode: CompanionResponseMode;
  suggestedReplies: string[];
  requestedField?: CompanionRequestedField | null;
  showRecommendation?: boolean;
  showBookingCTA?: boolean;
};
