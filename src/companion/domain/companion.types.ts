import type { StormEvidenceSnapshot } from '../../api/stormEvidence';

export type CompanionStage =
  | 'welcome'
  | 'interpret_report'
  | 'personalize_property'
  | 'live_intelligence'
  | 'recommend_action';

export type SourceMode = 'report' | 'personalized' | 'live';
export type LeadIntent = 'low' | 'medium' | 'high';

export type RequestedField =
  | 'exactAddress'
  | 'propertyType'
  | 'roofType'
  | 'yearBuilt'
  | 'damageHistory'
  | 'userGoal';

export type CompanionCTA = {
  label: string;
  action: 'personalize' | 'recommend' | 'schedule' | 'open_booking' | 'show_options';
};

export type CompanionRecommendation = {
  inspectionType: '4-Point Inspection' | 'Wind Mitigation Inspection' | 'Insurance Readiness Inspection';
  rationale: string;
  urgency: 'low' | 'medium' | 'high';
};

export type BookingHandoffPayload = {
  address?: string;
  city?: string;
  zipCode: string;
  inspectionType?: CompanionRecommendation['inspectionType'];
  rationaleSummary?: string;
};

export type CompanionReportContext = {
  reportId: string;
  zipCode: string;
  city?: string;
  county?: string;
  state?: string;
  lat?: number;
  lon?: number;
  stormScore: number;
  riskLevel: string;
  hurricaneScore: number;
  floodScore: number;
  coastalScore: number;
  evidenceSnapshot?: StormEvidenceSnapshot;
};

export type CompanionMessage = {
  id: string;
  role: 'assistant' | 'user' | 'system';
  stage: CompanionStage;
  text: string;
  timestamp: string;
  sourceMode?: SourceMode;
};

export type CompanionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportContext: CompanionReportContext;
  onOpenBooking?: (payload: BookingHandoffPayload) => void;
};

export type CompanionStatus = 'idle' | 'booting' | 'ready' | 'thinking' | 'error';

export type CompanionMachineState = 'closed' | 'booting' | 'ready' | 'thinking' | 'error';

export type CompanionSessionContext = {
  status: CompanionStatus;
  machineState: CompanionMachineState;
  activeStage: CompanionStage;
  sourceMode: SourceMode;
  currentInput: string;
  suggestedPrompts: string[];
  messages: CompanionMessage[];
  requestedFields: RequestedField[];
  personalization: {
    exactAddress?: string;
    propertyType?: string;
    roofType?: string;
    yearBuilt?: string;
    damageHistory?: string[];
    userGoal?: 'prevention' | 'insurance' | 'buy_sell' | 'recent_damage' | 'understand';
    completionScore: number;
  };
  recommendation?: CompanionRecommendation;
  activeCTA?: CompanionCTA;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type CompanionEvent =
  | { type: 'OPEN_MODAL' }
  | { type: 'BOOT_SUCCESS'; welcomeMessage: CompanionMessage; suggestedPrompts: string[] }
  | { type: 'BOOT_FAILURE'; code: string; message: string; retryable: boolean }
  | { type: 'CLOSE_MODAL' }
  | { type: 'RESET_SESSION' }
  | { type: 'USER_TYPED'; value: string }
  | { type: 'SELECT_PROMPT'; prompt: string }
  | { type: 'SUBMIT_MESSAGE'; text: string }
  | { type: 'FIELD_PROVIDED'; field: RequestedField; value: string | string[] }
  | {
      type: 'AI_RESPONSE_SUCCESS';
      payload: {
        stage: CompanionStage;
        sourceMode: SourceMode;
        userMessage: CompanionMessage;
        assistantMessage: CompanionMessage;
        suggestedPrompts: string[];
        requestedFields?: RequestedField[];
        personalization?: Partial<CompanionSessionContext['personalization']>;
        recommendation?: CompanionRecommendation;
        cta?: CompanionCTA;
      };
    }
  | { type: 'AI_RESPONSE_FAILURE'; code: string; message: string; retryable: boolean };
