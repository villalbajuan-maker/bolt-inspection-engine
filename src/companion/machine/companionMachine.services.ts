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

function hasEnoughContextForRecommendation(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext
) {
  const personalization = sessionContext.personalization;
  const structuralSignals =
    Number(Boolean(personalization.roofType)) + Number(Boolean(personalization.yearBuilt));
  const hasHighWindSignal = reportContext.hurricaneScore >= 4;
  const hasHighFloodSignal = reportContext.floodScore >= 4;

  if (!personalization.exactAddress) {
    return false;
  }

  if (personalization.userGoal) {
    return structuralSignals >= 1;
  }

  if (hasHighWindSignal && personalization.roofType) {
    return true;
  }

  if (hasHighFloodSignal && personalization.yearBuilt) {
    return true;
  }

  return structuralSignals >= 2;
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

function buildLiveIntelligenceMessage(
  reportContext: CompanionReportContext,
  sessionContext: CompanionSessionContext
): {
  message: string;
  prompts: string[];
} {
  const locationLabel = getLocationLabel(reportContext);
  const verifiedSignal = reportContext.evidenceSnapshot?.cards[0];
  const headline = verifiedSignal?.headline;
  const hasRecommendationContext = hasEnoughContextForRecommendation(reportContext, sessionContext);

  if (headline) {
    return {
      message: hasRecommendationContext
        ? `I found a verified public signal for ${locationLabel}: "${headline.title}" from ${headline.source}. I am treating it as supporting context around the home, so the next useful move is to turn that into a recommendation instead of staying at the news layer.`
        : `I found a verified public signal for ${locationLabel}: "${headline.title}" from ${headline.source}. I am treating it as supporting context, but the next useful move is to connect it to your home rather than staying at the regional level.`,
      prompts: hasRecommendationContext
        ? ['What should I do next?', 'What does this mean for my home?']
        : ['Personalize this for my home', 'What does this mean for my home?'],
    };
  }

  return {
    message: hasRecommendationContext
      ? `I do not have a verified local article stored for ${locationLabel} in this report snapshot, so I am using live context conservatively. I can still connect the broader wind, flood, and coastal picture to your decision, but the next useful move is to turn that into a recommendation instead of staying in regional context.`
      : `I do not have a verified local article stored for ${locationLabel} in this report snapshot, so I am using live context conservatively. I can still connect the broader wind, flood, and coastal picture to your home, but I should not imply a specific recent event that was not verified.`,
    prompts: hasRecommendationContext
      ? ['What should I do next?', 'Why this inspection?']
      : ['Personalize this for my home', 'What does this mean for my home?'],
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
  const hasRecommendationContext = hasEnoughContextForRecommendation(reportContext, sessionContext);

  if (lower.includes('what does this mean for my home') || lower.includes('what does this mean for my house')) {
    if (hasRecommendationContext) {
      const recommendation = buildRecommendation(reportContext, sessionContext);
      return {
        stage: 'recommend_action',
        message: `With the property details you already shared, the clearest next step for this home is a ${recommendation.inspectionType}. ${recommendation.rationale}`,
        prompts: [
          'Schedule my inspection',
          'Why this inspection?',
        ],
      };
    }
    return {
      stage: 'personalize_property',
      message: `I can make this much more useful for your home, but I need a little more property context first. Let’s start with the address so I can move from general area exposure to guidance tied to the actual property.`,
      prompts: ['Use this address', 'Why do you need my address?'],
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
      message: `Great. Let’s personalize this report to the property. We’ll start with the exact address so I can move from ${locationLabel} at the ZIP level toward the actual home.`,
      prompts: ['Use this address', 'Why do you need my address?'],
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
    const liveIntelligence = buildLiveIntelligenceMessage(reportContext, sessionContext);
    return {
      stage: 'live_intelligence',
      message: liveIntelligence.message,
      prompts: liveIntelligence.prompts,
    };
  }

  if (lower.includes('score') || lower.includes('report')) {
    return {
      stage: 'interpret_report',
      message: `Your storm score of ${reportContext.stormScore}/100 is a regional exposure reading, not a property inspection result. For ${locationLabel}, the biggest driver in this report is ${dominantFactor.key}, which means that is the first place to focus when deciding whether this home needs a closer look.`,
      prompts: [
        'What should I do next?',
        'Personalize this for my home',
      ],
    };
  }

  if (lower.includes('factor') || lower.includes('matter') || lower.includes('important')) {
    return {
      stage: 'interpret_report',
      message: `The strongest signal in this report is ${dominantFactor.key}. In practical terms, that is the factor most likely to shape real storm-related issues for this property area, so the next useful step is to see how that exposure translates to the condition of the actual home.`,
      prompts: [
        'What should I do next?',
        'How serious is this for insurance?',
      ],
    };
  }

  if (lower.includes('insurance')) {
    if (hasRecommendationContext) {
      const recommendation = buildRecommendation(reportContext, sessionContext);
      return {
        stage: 'recommend_action',
        message: `Based on your report and the property details you provided, the strongest next step is a ${recommendation.inspectionType}. ${recommendation.rationale}`,
        prompts: [
          'Schedule my inspection',
          'Why this inspection?',
        ],
      };
    }
    return {
      stage: 'interpret_report',
      message: `This report helps explain exposure, but it is not insurance documentation by itself. Its value is showing why an inspection may matter. If your goal is insurance readiness, the next step is to narrow this into the inspection that would create the strongest supporting documentation for your situation.`,
      prompts: [
        'What should I do next?',
        'What matters most in this report?',
      ],
    };
  }

  if (lower.includes('next') || lower.includes('should i do') || lower.includes('inspection')) {
    if (hasRecommendationContext) {
      const recommendation = buildRecommendation(reportContext, sessionContext);
      return {
        stage: 'recommend_action',
        message: `Based on your report and the property details you provided, the strongest next step is a ${recommendation.inspectionType}. ${recommendation.rationale}`,
        prompts: [
          'Schedule my inspection',
          'Why this inspection?',
        ],
      };
    }
    return {
      stage: 'personalize_property',
      message: `The next best step is to turn this regional report into property-specific guidance. I only need a few details about the home to narrow the recommendation and point you toward the right inspection.`,
      prompts: [
        'Use this address',
        'Why do you need my address?',
      ],
      requestedFields: ['exactAddress'],
    };
  }

  return {
    stage: 'interpret_report',
    message: `I can help interpret this report for ${locationLabel}. Right now it shows a ${reportContext.riskLevel.toLowerCase()} profile, with the strongest signal in ${dominantFactor.key}. From here, the most useful paths are to understand that signal, personalize it to the home, or move toward the right next step.`,
    prompts: [
      'Explain my storm score',
      'What should I do next?',
    ],
  };
}

function getNextRequestedField(sessionContext: CompanionSessionContext): RequestedField | undefined {
  const p = sessionContext.personalization;
  if (!p.exactAddress) return 'exactAddress';
  if (!p.roofType) return 'roofType';
  if (!p.yearBuilt) return 'yearBuilt';
  if (!p.userGoal) return 'userGoal';
  if (!p.damageHistory?.length) return 'damageHistory';
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
        prompts: ['Use this address', 'Why do you need my address?'],
      };
    case 'roofType':
      return {
        message: 'What type of roof does the property have? Roof type is one of the fastest ways to sharpen how wind exposure should be read for this home.',
        prompts: ['Shingle', 'Tile'],
      };
    case 'yearBuilt':
      return {
        message: 'Do you know roughly when the property was built? Construction era helps separate a broad regional signal from what may actually matter for this home.',
        prompts: ['Before 1995', '1995-2005'],
      };
    case 'userGoal':
      return {
        message: 'What are you mainly trying to solve right now? Your goal helps me decide what kind of inspection would be most useful next.',
        prompts: ['Prevention', 'Insurance'],
      };
    case 'damageHistory':
      return {
        message: 'One last optional signal: has the property had prior leaks, storm damage, or insurance claims? This can sharpen urgency, but I may already have enough to recommend a next step.',
        prompts: ['Previous leaks', 'No known issues'],
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

  const nextSessionContext = {
    ...sessionContext,
    personalization: nextState,
  };

  const readyForRecommendation = hasEnoughContextForRecommendation(
    reportContext,
    nextSessionContext
  );
  const nextField = readyForRecommendation
    ? undefined
    : getNextRequestedField(nextSessionContext);
  const recommendation =
    readyForRecommendation || !nextField
      ? buildRecommendation(reportContext, nextSessionContext)
      : undefined;

  const assistantMessage: CompanionMessage = {
    id: `assistant-${Date.now() + 1}`,
    role: 'assistant',
    stage: nextField ? 'personalize_property' : 'recommend_action',
    text: nextField
      ? buildPersonalizationQuestion(nextField, reportContext).message
      : `Great, I already have enough property context to move beyond the ZIP-level reading. The best next step for this property is a ${recommendation?.inspectionType}. ${recommendation?.rationale}`,
    timestamp: new Date().toISOString(),
    sourceMode: 'personalized',
  };

  const nextPrompts = nextField
    ? buildPersonalizationQuestion(nextField, reportContext).prompts
    : ['Schedule my inspection', 'Why this inspection?'];

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
