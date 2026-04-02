import { supabase } from '../lib/supabaseClient';
import { InspectionRequest } from '../types';

export async function submitInspectionRequest(
  request: InspectionRequest
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('inspection_requests')
    .insert([request]);

  if (error) {
    console.error('Error submitting inspection request:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export interface InspectionBooking {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  preferredDate: string;
  preferredTime: string;
  inspectionType: string;
  stormScore?: number;
  riskLevel?: string;
}

export async function submitInspectionBooking(
  booking: InspectionBooking
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('inspection_bookings')
    .insert([{
      full_name: booking.fullName,
      phone: booking.phone,
      email: booking.email,
      address: booking.address,
      city: booking.city,
      zip_code: booking.zipCode,
      preferred_date: booking.preferredDate,
      preferred_time: booking.preferredTime,
      inspection_type: booking.inspectionType,
      storm_score: booking.stormScore,
      risk_level: booking.riskLevel,
      status: 'pending'
    }]);

  if (error) {
    console.error('Error submitting inspection booking:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
