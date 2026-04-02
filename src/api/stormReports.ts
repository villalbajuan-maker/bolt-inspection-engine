import { StormEvidenceSnapshot } from './stormEvidence';
import { supabase } from '../lib/supabaseClient';

export interface StormRiskReportData {
  name: string;
  email: string;
  phone?: string;
  zip_code: string;
  city?: string;
  storm_score: number;
  risk_level: string;
  hurricane_score: number;
  flood_score: number;
  coastal_score: number;
  insurance_claim_score: number;
  lat?: number;
  lon?: number;
  evidence_snapshot?: StormEvidenceSnapshot;
}

export interface StormRiskReport extends StormRiskReportData {
  id: string;
  created_at: string;
}

export async function saveStormRiskReport(data: StormRiskReportData): Promise<StormRiskReport> {
  const { data: report, error } = await supabase
    .from('storm_risk_reports')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save storm risk report: ${error.message}`);
  }

  return report;
}

export async function getStormRiskReport(reportId: string): Promise<StormRiskReport | null> {
  const { data, error } = await supabase
    .from('storm_risk_reports')
    .select('*')
    .eq('id', reportId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch storm risk report: ${error.message}`);
  }

  return data;
}

export function getRiskLevel(score: number): string {
  if (score >= 90) return 'HIGH';
  if (score >= 65) return 'MODERATE';
  return 'LOW';
}

export function getRiskColorClass(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH':
      return 'text-red-600';
    case 'MODERATE':
      return 'text-amber-600';
    case 'LOW':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}

export function getRiskBgColorClass(riskLevel: string): string {
  switch (riskLevel) {
    case 'HIGH':
      return 'bg-red-500';
    case 'MODERATE':
      return 'bg-amber-500';
    case 'LOW':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}
