import { useEffect, useMemo, useReducer } from 'react';
import { companionMachine, createInitialCompanionState } from '../machine/companionMachine';
import * as selectors from '../machine/companionMachine.selectors';
import {
  bootResolver,
  resolveCompanionTurn,
  resolvePersonalizationStep,
} from '../machine/companionMachine.services';
import type { CompanionReportContext } from '../domain/companion.types';

type UseCompanionMachineParams = {
  isOpen: boolean;
  reportContext: CompanionReportContext;
};

export function useCompanionMachine({
  isOpen,
  reportContext,
}: UseCompanionMachineParams) {
  const [context, send] = useReducer(companionMachine, undefined, createInitialCompanionState);

  useEffect(() => {
    if (isOpen) {
      send({ type: 'OPEN_MODAL' });
    } else {
      send({ type: 'CLOSE_MODAL' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (context.machineState !== 'booting') {
      return;
    }

    let cancelled = false;

    void bootResolver(reportContext)
      .then((payload) => {
        if (cancelled) return;
        send({
          type: 'BOOT_SUCCESS',
          welcomeMessage: payload.welcomeMessage,
          suggestedPrompts: payload.suggestedPrompts,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        send({
          type: 'BOOT_FAILURE',
          code: 'BOOT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to initialize the Companion.',
          retryable: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [context.machineState, reportContext]);

  useEffect(() => {
    if (context.machineState !== 'thinking') {
      return;
    }

    const text = context.currentInput.trim();
    if (!text) {
      send({
        type: 'AI_RESPONSE_FAILURE',
        code: 'EMPTY_MESSAGE',
        message: 'Please enter a question before sending.',
        retryable: true,
      });
      return;
    }

    let cancelled = false;

    const activeField = context.requestedFields[0];
    const resolver = activeField
      ? resolvePersonalizationStep(reportContext, context, activeField, text)
      : resolveCompanionTurn(reportContext, context, text);

    void resolver.then((payload) => {
      if (cancelled) return;
      send({
        type: 'AI_RESPONSE_SUCCESS',
        payload,
      });
    }).catch((error) => {
      if (cancelled) return;
      send({
        type: 'AI_RESPONSE_FAILURE',
        code: 'TURN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to resolve Companion response.',
        retryable: true,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [context, reportContext]);

  const derivedSelectors = useMemo(
    () => ({
      activeStage: selectors.selectActiveStage(context),
      suggestedPrompts: selectors.selectSuggestedPrompts(context),
      messages: selectors.selectMessages(context),
      sourceMode: selectors.selectSourceMode(context),
      currentInput: selectors.selectCurrentInput(context),
      requestedFields: selectors.selectRequestedFields(context),
      personalization: selectors.selectPersonalization(context),
      recommendation: selectors.selectRecommendation(context),
      activeCTA: selectors.selectActiveCTA(context),
      isThinking: selectors.selectIsThinking(context),
      isError: selectors.selectIsError(context),
    }),
    [context]
  );

  return {
    context,
    send,
    selectors: derivedSelectors,
  };
}
