import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const evalCasesPath = path.join(cwd, 'evals', 'companion-chat.cases.json');
const envPath = path.join(cwd, '.env');

async function loadEnvFile() {
  try {
    const raw = await fs.readFile(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (_error) {
    // Ignore missing .env and rely on process env.
  }
}

function normalizeText(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function matchesAnyNeedle(haystack, needles = []) {
  const normalizedHaystack = normalizeText(haystack);
  return needles.some((needle) => normalizedHaystack.includes(normalizeText(needle)));
}

function evaluateResponse(caseDefinition, response) {
  const expectations = caseDefinition.expectations || {};
  const failures = [];

  if (
    expectations.responseModeOneOf &&
    !expectations.responseModeOneOf.includes(response.responseMode)
  ) {
    failures.push(
      `responseMode "${response.responseMode}" not in expected set: ${expectations.responseModeOneOf.join(', ')}`
    );
  }

  if (
    expectations.mustMentionOneOf &&
    !matchesAnyNeedle(response.assistantMessage, expectations.mustMentionOneOf)
  ) {
    failures.push(
      `assistantMessage did not mention any expected phrase: ${expectations.mustMentionOneOf.join(', ')}`
    );
  }

  if (expectations.mustNotMention) {
    const blockedPhrase = expectations.mustNotMention.find((needle) =>
      matchesAnyNeedle(response.assistantMessage, [needle])
    );
    if (blockedPhrase) {
      failures.push(`assistantMessage mentioned blocked phrase: ${blockedPhrase}`);
    }
  }

  if (expectations.mustShowRecommendation && !response.showRecommendation) {
    failures.push('showRecommendation was false');
  }

  if (expectations.mustNotShowBookingCTA && response.showBookingCTA) {
    failures.push('showBookingCTA was true unexpectedly');
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

async function callCompanionChat(baseUrl, anonKey, payload) {
  const response = await fetch(`${baseUrl}/functions/v1/companion-chat`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  await loadEnvFile();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  }

  const rawCases = await fs.readFile(evalCasesPath, 'utf8');
  const cases = JSON.parse(rawCases);

  const requestedCaseId = process.argv.find((arg) => arg.startsWith('--case='))?.split('=')[1];
  const selectedCases = requestedCaseId
    ? cases.filter((entry) => entry.id === requestedCaseId)
    : cases;

  if (!selectedCases.length) {
    throw new Error(`No evaluation case matched "${requestedCaseId}".`);
  }

  let passedCount = 0;

  for (const caseDefinition of selectedCases) {
    try {
      const response = await callCompanionChat(supabaseUrl, anonKey, caseDefinition.payload);
      const evaluation = evaluateResponse(caseDefinition, response);

      if (evaluation.passed) {
        passedCount += 1;
        console.log(`PASS ${caseDefinition.id}: ${caseDefinition.description}`);
      } else {
        console.log(`FAIL ${caseDefinition.id}: ${caseDefinition.description}`);
        for (const failure of evaluation.failures) {
          console.log(`  - ${failure}`);
        }
      }

      console.log(`  responseMode: ${response.responseMode}`);
      console.log(`  showRecommendation: ${Boolean(response.showRecommendation)}`);
      console.log(`  showBookingCTA: ${Boolean(response.showBookingCTA)}`);
      console.log(`  assistantMessage: ${response.assistantMessage}`);
      console.log('');
    } catch (error) {
      console.log(`ERROR ${caseDefinition.id}: ${caseDefinition.description}`);
      console.log(`  - ${error instanceof Error ? error.message : String(error)}`);
      console.log('');
    }
  }

  console.log(`Summary: ${passedCount}/${selectedCases.length} cases passed.`);

  if (passedCount !== selectedCases.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
