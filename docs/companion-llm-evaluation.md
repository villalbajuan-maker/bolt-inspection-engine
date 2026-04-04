# Companion LLM Evaluation

This repo includes a lightweight evaluation harness for the `companion-chat` function.

## Run

```bash
npm run eval:companion
```

Run a single case:

```bash
npm run eval:companion -- --case=score-meaning-zip-level
```

## What it checks

- groundedness to ZIP-level report context
- honesty about property-level uncertainty
- recommendation alignment to deterministic `inspectionType`
- evidence interpretation quality
- refusal quality for damage-diagnosis questions
- booking CTA discipline

## Files

- `/Users/juanvillalba/Downloads/bolt-inspection-engine/evals/companion-chat.cases.json`
- `/Users/juanvillalba/Downloads/bolt-inspection-engine/scripts/evaluateCompanionChat.mjs`

## Notes

- The harness uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- It is intentionally heuristic, not a full grading framework.
- Treat failures as review prompts, not as perfect model judgments.
