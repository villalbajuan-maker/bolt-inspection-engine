const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEFAULT_TRANSCRIBE_MODEL = Deno.env.get("OPENAI_TRANSCRIBE_MODEL") || "whisper-1";
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function transcribeAudio(audioFile: File) {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("file", audioFile, audioFile.name || "companion-recording.webm");
  formData.append("model", DEFAULT_TRANSCRIBE_MODEL);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI transcription request failed: ${errorText}`);
  }

  const data = await response.json() as { text?: string };
  return data.text?.trim() || "";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return jsonResponse({ error: "Audio file is required." }, 400);
    }

    if (audio.size === 0) {
      return jsonResponse({ error: "Audio file is empty." }, 400);
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      return jsonResponse({ error: "Audio file is too large." }, 413);
    }

    const transcript = await transcribeAudio(audio);

    if (!transcript) {
      return jsonResponse({ error: "No transcript was returned." }, 422);
    }

    return jsonResponse({ transcript });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to transcribe audio.",
      },
      500,
    );
  }
});
