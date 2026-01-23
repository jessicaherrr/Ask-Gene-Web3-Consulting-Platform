export type ConsultationStatus = 
  | 'pending_payment'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface Consultation {
  id: string;
  client_id: string;
  consultant_id: string;
  scheduled_time: string;
  amount: number;
  status: ConsultationStatus;
  transaction_hash?: string;
  contract_address?: string;
  contract_session_id?: number;
  notes?: string;
  duration_minutes: number;
  payment_method: 'crypto' | 'stripe';
  stripe_payment_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
}

// State machine transitions
export const STATUS_TRANSITIONS: Record<ConsultationStatus, ConsultationStatus[]> = {
  pending_payment: ['scheduled', 'cancelled'],
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

// Helper functions
export function formatConsultationDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return end.toISOString();
}