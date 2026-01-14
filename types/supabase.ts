// types/supabase.ts
export interface Consultant {
  id: string;
  wallet_address: string;
  name: string;
  title: string | null;
  bio: string | null;
  expertise: string[] | null;
  hourly_rate: number;
  min_duration_hours: number;
  max_duration_hours: number;
  rating: number;
  total_sessions: number;
  total_hours: number;
  total_earnings: number;
  is_verified: boolean;
  is_active: boolean;
  verification_level: string | null;
  languages: string[] | null;
  availability: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  wallet_address: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  consultant_id: string;
  client_wallet_address: string;
  title: string;
  description: string | null;
  scheduled_for: string;
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  status: string;
  payment_status: string;
  currency: string;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}