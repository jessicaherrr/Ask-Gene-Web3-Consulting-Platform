// Payment method types
export type PaymentMethod = 'crypto' | 'stripe';

// Payment session data interface
export interface PaymentSessionData {
  sessionId: string;
  amount: number;
  consultantId: string;
  consultantName: string;
  duration: number;
  dateTime: string;
}

// Consultation status types
export type ConsultationStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending_payment';

// Transaction interface
export interface TransactionData {
  hash: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
}