export type CompanionTranscribeResponse = {
  transcript: string;
};

export async function transcribeCompanionAudio(blob: Blob): Promise<CompanionTranscribeResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const formData = new FormData();
  const extension = blob.type.includes('mp4')
    ? 'm4a'
    : blob.type.includes('ogg')
      ? 'ogg'
      : 'webm';
  formData.append('audio', blob, `companion-recording.${extension}`);

  const response = await fetch(`${supabaseUrl}/functions/v1/companion-transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Companion transcription failed: ${errorText}`);
  }

  const data = (await response.json()) as Partial<CompanionTranscribeResponse>;
  const transcript = typeof data.transcript === 'string' ? data.transcript.trim() : '';

  if (!transcript) {
    throw new Error('Companion transcription returned no text.');
  }

  return { transcript };
}
