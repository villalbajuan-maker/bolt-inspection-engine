export interface ZipRiskData {
  id: string;
  zip_code: string;
  hurricane_risk_score: number;
  flood_risk_score: number;
  coastal_exposure_score: number;
  insurance_claim_risk: string;
  overall_risk_score: number;
  region?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InspectionRequest {
  id?: string;
  full_name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  preferred_date: string;
  preferred_time_window: string;
  inspection_type: string;
  source?: string;
  status?: string;
  created_at?: string;
}

export interface ConversionEvent {
  id?: string;
  event_type: string;
  zip_entered?: string;
  inspection_booked?: boolean;
  session_id?: string;
  user_agent?: string;
  timestamp?: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';

export interface RiskModalData {
  zipCode: string;
  overallRisk: number;
  hurricaneRisk: number;
  floodRisk: number;
  coastalExposure: number;
  insuranceClaimRisk: string;
}

export interface StormRiskResponse {
  zip: string;
  score: number;
  risk_level: string;
  hurricane_risk: number;
  flood_risk: number;
  coastal_exposure: number;
  insurance_risk: string;
}
