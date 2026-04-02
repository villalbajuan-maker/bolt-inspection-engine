import { supabase } from '../lib/supabaseClient';
import { ConversionEvent } from '../types';

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

export async function trackEvent(
  eventType: string,
  zipEntered?: string,
  inspectionBooked: boolean = false
): Promise<void> {
  const event: ConversionEvent = {
    event_type: eventType,
    zip_entered: zipEntered || '',
    inspection_booked: inspectionBooked,
    session_id: getSessionId(),
    user_agent: navigator.userAgent,
  };

  const { error } = await supabase
    .from('conversion_events')
    .insert([event]);

  if (error) {
    console.error('Error tracking event:', error);
  }
}
