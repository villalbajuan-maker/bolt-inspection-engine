import { buildWelcomeMessage, DEFAULT_PROMPTS } from '../domain/companion.constants';
import type {
  CompanionCTA,
  CompanionMessage,
  CompanionRecommendation,
  CompanionReportContext,
  CompanionSessionContext,
  RequestedField,
} from '../domain/companion.types';

function getLocationLabel(reportContext: CompanionReportContext) {
  return reportContext.county
    ? [reportContext.city, reportContext.county, reportContext.state || 'Florida'].filter(Boolean).join(', ')
    : reportContext.city
      ? `${reportContext.city}, Florida`
      : `ZIP ${reportContext.zipCode}`;
}

export async function bootResolver(reportContext: CompanionReportContext): Promise<{
  welcomeMessage: CompanionMessage;
  suggestedPrompts: string[];
}> {
  return {
    welcomeMessage: buildWelcomeMessage(getLocationLabel(reportContext)),
    suggestedPrompts: DEFAULT_PROMPTS,
  };
}

function getDominantFactor(reportContext: CompanionReportContext) {
  const factors = [
    { key: 'wind exposure', score: reportContext.hurricaneScore },
    { key: 'flood exposure', score: reportContext.floodScore },
    { key: 'coastal pressure', score: reportContext.coastalScore },
  ].sort((a, b) => b.score - a.score);

  return factors[0];
}

function buildRecommendation(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext
): CompanionRecommendation {
  const goal = sessionContext.personalization.userGoal;
  const roofType = sessionContext.personalization.roofType;
  const hasDamageHistory = Boolean(sessionContext.personalization.damageHistory?.length) &&
    !sessionContext.personalization.damageHistory?.includes('No known issues');

  if (goal === 'insurance') {
    return {
      inspectionType: 'Insurance Readiness Inspection',
      urgency: 'high',
      rationale: 'Your stated goal is insurance-focused, so the strongest next step is an inspection aimed at documentation, underwriting readiness, and follow-up clarity.',
    };
  }

  if (roofType === 'Metal' || roofType === 'Tile' || reportContext.hurricaneScore >= 4) {
    return {
      inspectionType: 'Wind Mitigation Inspection',
      urgency: hasDamageHistory ? 'high' : 'medium',
      rationale: 'The report’s wind signal is strong enough that validating roof and wind-mitigation features is likely the most valuable next step for this property.',
    };
  }

  return {
    inspectionType: '4-Point Inspection',
    urgency: hasDamageHistory || reportContext.floodScore >= 4 ? 'high' : 'medium',
    rationale: 'A 4-Point inspection is the best broad next step here because it can translate the regional risk profile into a practical view of the home’s current condition.',
  };
}

function buildLiveIntelligenceMessage(reportContext: CompanionReportContext): {
  message: string;
  prompts: string[];
} {
  const locationLabel = getLocationLabel(reportContext);
  const verifiedSignal = reportContext.evidenceSnapshot?.cards[0];
  const headline = verifiedSignal?.headline;

  if (headline) {
    return {
      message: `I found a verified public signal for ${locationLabel}: "${headline.title}" from ${headline.source}. I am treating that as live regional context, and pairing it with the report’s broader wind and flood profile so we can separate what is current from what is structural.`,
      prompts: [
        'What does this mean for my home?',
        'Personalize this for my home',
        'What should I do next?',
      ],
    };
  }

  return {
    message: `I do not have a verified local article stored for ${locationLabel} in this report snapshot, so I am using the live evidence layer more conservatively. That means the Companion can still talk about regional wind, flood, and coastal exposure, but it should not imply a specific recent local event that was not verified.`,
    prompts: [
      'What does this mean for my home?',
      'Personalize this for my home',
      'What should I do next?',
    ],
  };
}

function buildInterpretationMessage(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext,
  text: string
): { stage: 'interpret_report' | 'personalize_property' | 'recommend_action' | 'live_intelligence'; message: string; prompts: string[]; requestedFields?: RequestedField[] } {
  const lower = text.toLowerCase();
  const locationLabel = getLocationLabel(reportContext);
  const dominantFactor = getDominantFactor(reportContext);

  if (lower.includes('what does this mean for my home') || lower.includes('what does this mean for my house')) {
    if (sessionContext.personalization.completionScore >= 0.6) {
      const recommendation = buildRecommendation(reportContext, sessionContext);
      return {
        stage: 'recommend_action',
        message: `With the property details you already shared, the best way to translate the live and regional signals into action is a ${recommendation.inspectionType}. ${recommendation.rationale}`,
        prompts: [
          'Why this inspection?',
          'What does that inspection include?',
          'Schedule my inspection',
        ],
      };
    }
    return {
      stage: 'personalize_property',
      message: `I can translate the regional and live signals into property-level guidance, but I need a little more context about the home first. Let’s start with the address so the Companion can move from general location risk to a more useful property-specific interpretation.`,
      prompts: ['Use this address', 'Skip to roof type', 'Why do you need my address?'],
      requestedFields: ['exactAddress'],
    };
  }

  if (
    lower.includes('personalize') ||
    lower.includes('my home') ||
    lower.includes('my house') ||
    (lower.includes('property') && !lower.includes('recent activity'))
  ) {
    return {
      stage: 'personalize_property',
      message: `Great. Let’s personalize this report to the property. We’ll start with the exact address so the Companion can move from ${locationLabel} at the ZIP level toward the actual home.`,
      prompts: ['Use this address', 'Why do you need my address?', 'Skip to roof type'],
      requestedFields: ['exactAddress'],
    };
  }

  if (
    lower.includes('recent storm') ||
    lower.includes('storm activity') ||
    lower.includes('local news') ||
    lower.includes('recent flooding') ||
    lower.includes('current conditions') ||
    lower.includes('what happened here') ||
    lower.includes('latest storm') ||
    lower.includes('news') ||
    lower.includes('flooding here')
  ) {
    const liveIntelligence = buildLiveIntelligenceMessage(reportContext);
    return {
      stage: 'live_intelligence',
      message: liveIntelligence.message,
      prompts: liveIntelligence.prompts,
    };
  }

  if (lower.includes('score') || lower.includes('report')) {
    return {
      stage: 'interpret_report',
      message: `Your storm score of ${reportContext.stormScore}/100 reflects regional exposure, not a full property inspection result. For ${locationLabel}, the strongest signal in this report is ${dominantFactor.key}, which is why the report is framing this as a meaningful readiness issue rather than just general awareness.`,
      prompts: [
        'What factor matters most?',
        'How serious is this for insurance?',
        'Personalize this for my home',
      ],
    };
  }

  if (lower.includes('factor') || lower.includes('matter') || lower.includes('important')) {
    return {
      stage: 'interpret_report',
      message: `The most important factor in this report is ${dominantFactor.key}. In practical terms, that means the report sees the biggest risk signal coming from that category more than the others, so the next useful step is to validate how that regional exposure translates to your specific property condition.`,
      prompts: [
        'Explain my storm score',
        'What should I do next?',
        'Personalize this for my home',
      ],
    };
  }

  if (lower.includes('insurance')) {
    if (sessionContext.personalization.completionScore >= 0.6) {
      const recommendation = buildRecommendation(reportContext, sessionContext);
      return {
        stage: 'recommend_action',
        message: `Based on your report and the property details you provided, the strongest next step is a ${recommendation.inspectionType}. ${recommendation.rationale}`,
        prompts: [
          'What does that inspection include?',
          'Why this inspection?',
          'Schedule my inspection',
        ],
      };
    }
    return {
      stage: 'interpret_report',
      message: `This report can help frame the conversation around exposure, but it is not insurance documentation by itself. Its value is that it shows why an inspection may matter. If your goal is insurance readiness, the next useful step is to identify which inspection would produce the strongest supporting documentation for your situation.`,
      prompts: [
        'What should I do next?',
        'Personalize this for my home',
        'Explain my storm score',
      ],
    };
  }

  if (lower.includes('next') || lower.includes('should i do') || lower.includes('inspection')) {
    if (sessionContext.personalization.completionScore >= 0.6) {
      const recommendation = buildRecommendation(reportContext, sessionContext);
      return {
        stage: 'recommend_action',
        message: `Based on your report and the property details you provided, the strongest next step is a ${recommendation.inspectionType}. ${recommendation.rationale}`,
        prompts: [
          'What does that inspection include?',
          'Why this inspection?',
          'Schedule my inspection',
        ],
      };
    }
    return {
      stage: 'interpret_report',
      message: `The next best step is to translate this regional report into property-specific guidance. Right now the report tells you where the exposure is coming from. The next layer is to add details about the home itself so the Companion can narrow the recommendation and point you toward the most relevant inspection.`,
      prompts: [
        'Personalize this for my home',
        'What factor matters most?',
        'How serious is this for insurance?',
      ],
    };
  }

  return {
    stage: 'interpret_report',
    message: `I can help interpret this report for ${locationLabel}. The current report shows a ${reportContext.riskLevel.toLowerCase()} profile with the strongest signal in ${dominantFactor.key}. If you want, we can go deeper into what that means, how it connects to insurance, or how to personalize it to the property.`,
    prompts: [
      'Explain my storm score',
      'What factor matters most?',
      'What should I do next?',
    ],
  };
}

function getNextRequestedField(sessionContext: CompanionSessionContext): RequestedField | undefined {
  const p = sessionContext.personalization;
  if (!p.exactAddress) return 'exactAddress';
  if (!p.roofType) return 'roofType';
  if (!p.yearBuilt) return 'yearBuilt';
  if (!p.damageHistory?.length) return 'damageHistory';
  if (!p.userGoal) return 'userGoal';
  return undefined;
}

function buildPersonalizationQuestion(field: RequestedField, reportContext: CompanionReportContext): {
  message: string;
  prompts: string[];
} {
  switch (field) {
    case 'exactAddress':
      return {
        message: `Let’s start with the property address. This helps the Companion move beyond ZIP ${reportContext.zipCode} and prepare more property-specific guidance.`,
        prompts: ['Use this address', 'Skip to roof type'],
      };
    case 'roofType':
      return {
        message: 'What type of roof does the property have? Roof type can materially change how wind and water vulnerabilities should be interpreted.',
        prompts: ['Shingle', 'Tile', 'Metal'],
      };
    case 'yearBuilt':
      return {
        message: 'Do you know roughly when the property was built? Construction era helps frame how much weight to place on the regional wind and water signals.',
        prompts: ['Before 1995', '1995-2005', '2006-2015'],
      };
    case 'damageHistory':
      return {
        message: 'Has the property had prior leaks, storm damage, or insurance claims? That gives the Companion a much stronger signal about real vulnerability.',
        prompts: ['Previous leaks', 'Storm damage', 'No known issues'],
      };
    case 'userGoal':
      return {
        message: 'What are you mainly trying to solve right now? Your goal changes the kind of recommendation the Companion should make next.',
        prompts: ['Prevention', 'Insurance', 'Understand my risk'],
      };
    default:
      return {
        message: 'Let’s continue personalizing the report.',
        prompts: [],
      };
  }
}

export async function resolveCompanionTurn(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext,
  text: string
): Promise<{
  stage: 'interpret_report' | 'personalize_property' | 'recommend_action' | 'live_intelligence';
  sourceMode: 'report' | 'personalized' | 'live';
  userMessage: CompanionMessage;
  assistantMessage: CompanionMessage;
  suggestedPrompts: string[];
  requestedFields?: RequestedField[];
  recommendation?: CompanionRecommendation;
  cta?: CompanionCTA;
}> {
  const now = new Date().toISOString();
  const userMessage: CompanionMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    stage: sessionContext.activeStage,
    text,
    timestamp: now,
  };

  const interpretation = buildInterpretationMessage(reportContext, sessionContext, text);
  const recommendation =
    interpretation.stage === 'recommend_action'
      ? buildRecommendation(reportContext, sessionContext)
      : undefined;

  const assistantMessage: CompanionMessage = {
    id: `assistant-${Date.now() + 1}`,
    role: 'assistant',
    stage: interpretation.stage,
    text: interpretation.message,
    timestamp: new Date().toISOString(),
    sourceMode:
      interpretation.stage === 'interpret_report'
        ? 'report'
        : interpretation.stage === 'live_intelligence'
          ? 'live'
        : 'personalized',
  };

  return {
    stage: interpretation.stage,
    sourceMode:
      interpretation.stage === 'interpret_report'
        ? 'report'
        : interpretation.stage === 'live_intelligence'
          ? 'live'
        : 'personalized',
    userMessage,
    assistantMessage,
    suggestedPrompts: interpretation.prompts,
    requestedFields: interpretation.requestedFields,
    recommendation,
    cta:
      interpretation.stage === 'recommend_action'
        ? {
            label: 'Schedule My Inspection',
            action: 'open_booking',
          }
        : undefined,
  };
}

export async function resolvePersonalizationStep(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext,
  field: RequestedField,
  value: string | string[]
): Promise<{
  stage: 'personalize_property' | 'recommend_action';
  sourceMode: 'personalized';
  userMessage: CompanionMessage;
  assistantMessage: CompanionMessage;
  suggestedPrompts: string[];
  requestedFields?: RequestedField[];
  personalization?: Partial<CompanionSessionContext['personalization']>;
  recommendation?: CompanionRecommendation;
  cta?: CompanionCTA;
}> {
  const now = new Date().toISOString();
  const userText = Array.isArray(value) ? value.join(', ') : value;
  const userMessage: CompanionMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    stage: 'personalize_property',
    text: userText,
    timestamp: now,
  };

  const updatedPersonalization: Partial<CompanionSessionContext['personalization']> = {
    [field]:
      field === 'damageHistory'
        ? (value as string[])
        : value,
  };

  const nextState = {
    ...sessionContext.personalization,
    ...updatedPersonalization,
  };

  const nextField = getNextRequestedField({
    ...sessionContext,
    personalization: nextState,
  });
  const recommendation = !nextField
    ? buildRecommendation(reportContext, {
        ...sessionContext,
        personalization: nextState,
      })
    : undefined;

  const assistantMessage: CompanionMessage = {
    id: `assistant-${Date.now() + 1}`,
    role: 'assistant',
    stage: nextField ? 'personalize_property' : 'recommend_action',
    text: nextField
      ? buildPersonalizationQuestion(nextField, reportContext).message
      : `Great, we now have enough property context to move beyond the ZIP-level reading. The best next step for this property is a ${recommendation?.inspectionType}. ${recommendation?.rationale}`,
    timestamp: new Date().toISOString(),
    sourceMode: 'personalized',
  };

  const nextPrompts = nextField
    ? buildPersonalizationQuestion(nextField, reportContext).prompts
    : ['What inspection would you recommend?', 'Why does this change the report?', 'What should I do next?'];

  return {
    stage: nextField ? 'personalize_property' : 'recommend_action',
    sourceMode: 'personalized',
    userMessage,
    assistantMessage,
    suggestedPrompts: nextPrompts,
    requestedFields: nextField ? [nextField] : [],
    personalization: updatedPersonalization,
    recommendation,
    cta: !nextField
      ? {
          label: 'Schedule My Inspection',
          action: 'open_booking',
        }
      : undefined,
  };
}
