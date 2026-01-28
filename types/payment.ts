// @/types/payment.ts

// ============================================
// PAYMENT TYPES MATCHING DATABASE SCHEMA
// ============================================

// Payment method types (from consultations table)
export type PaymentMethod = 'crypto' | 'stripe';

// Payment status types (from consultations table)
export type PaymentStatus = 
  | 'unpaid'              // Initial state, no payment made
  | 'pending'             // Payment initiated but not confirmed
  | 'processing'          // Crypto: transaction sent but not yet confirmed
  | 'confirming'          // Crypto: transaction has some confirmations
  | 'succeeded'           // Payment successful
  | 'failed'              // Payment failed
  | 'refunded'            // Payment refunded
  | 'cancelled';          // Payment cancelled

// Consultation status types (from consultations table)
export type ConsultationStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Network types for blockchain
export type BlockchainNetwork = 'polygon' | 'ethereum' | 'arbitrum' | 'polygon-amoy';

// Cryptocurrency types
export type CryptoCurrency = 'MATIC' | 'ETH' | 'USDC' | 'USDT';

// ============================================
// INTERFACES MATCHING DATABASE TABLES
// ============================================

// Payment session data for booking flow
export interface PaymentSessionData {
  // Core booking information
  sessionId: string;
  amount: number;                    // USD amount
  consultantId: string;              // UUID from consultants table
  consultantName: string;
  duration: number;                  // Hours
  dateTime: string;                  // ISO string for scheduled_for
  
  // Additional fields that might be needed
  title?: string;                    // Optional title for consultation
  description?: string;              // Optional description
  hourlyRate?: number;               // Hourly rate in USD
  totalAmount?: number;              // Total amount (duration * hourlyRate)
  currency?: string;                 // Currency code, default 'USD'
  paymentMethod?: PaymentMethod;     // Default based on user choice
  
  // Customer information
  customerEmail?: string;
  customerName?: string;
  customerAddress?: string;          // Wallet address for crypto payments
  
  // Blockchain information (for crypto payments)
  network?: BlockchainNetwork;       // Default 'polygon'
  cryptoCurrency?: CryptoCurrency;   // Default 'MATIC'
  contractAddress?: string;          // Smart contract address
}

// Consultation interface matching consultations table
export interface Consultation {
  id: string;                        // UUID
  consultant_id: string;             // UUID from consultants table
  client_wallet_address: string;
  title: string;
  description?: string;
  scheduled_for: string;             // ISO timestamp
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  status: ConsultationStatus;
  payment_status: PaymentStatus;
  currency: string;                  // Default 'USD'
  
  // Stripe payment fields
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  
  // Crypto payment fields
  crypto_transaction_hash?: string;
  crypto_payment_address?: string;
  crypto_currency?: CryptoCurrency;
  crypto_amount?: string;            // String to preserve precision
  network?: BlockchainNetwork;
  contract_session_id?: string;
  contract_address?: string;
  gas_used?: string;
  block_number?: number;
  blockchain_explorer_url?: string;
  
  // Common payment fields
  payment_id?: string;               // Universal payment ID
  payment_method?: PaymentMethod;
  refund_id?: string;
  cancellation_reason?: string;
  cancelled_by?: string;             // 'client' or 'consultant'
  
  // Meeting information
  meeting_link?: string;
  google_calendar_event_id?: string;
  google_meet_link?: string;
  
  // Timestamps
  created_at: string;                // ISO timestamp
  updated_at: string;                // ISO timestamp
}

// Transaction interface for payment records
export interface TransactionData {
  id: string;                        // UUID
  consultation_id: string;           // UUID from consultations table
  
  // Payment Information
  payment_method: PaymentMethod;
  payment_provider?: string;         // 'stripe', 'polygon', 'ethereum'
  provider_payment_id: string;       // Stripe payment intent ID or blockchain transaction hash
  
  // Financial Details
  amount: number;                    // USD amount
  crypto_amount?: string;            // String to preserve precision
  currency: string;                  // Default 'USD'
  crypto_currency?: CryptoCurrency;
  
  // Blockchain Details (for crypto payments)
  transaction_hash?: string;
  from_address?: string;
  to_address?: string;
  network?: BlockchainNetwork;
  gas_used?: string;
  block_number?: number;
  
  // Status
  status: PaymentStatus;
  metadata?: Record<string, any>;    // JSONB field
  
  // Timestamps
  created_at: string;                // ISO timestamp
  updated_at: string;                // ISO timestamp
}

// Crypto transaction interface matching crypto_transactions table
export interface CryptoTransaction {
  id: string;                        // UUID
  consultation_id: string;           // UUID from consultations table
  
  // Transaction Details
  transaction_hash: string;          // Unique blockchain transaction hash
  from_address: string;
  to_address: string;
  contract_address?: string;
  
  // Amount and Token Details
  value: string;                     // String to preserve precision (wei)
  token_address?: string;
  token_symbol?: string;
  token_decimals?: number;
  
  // Blockchain Details
  network: BlockchainNetwork;
  chain_id: number;                  // 137 for Polygon Mainnet, 80002 for Polygon Amoy
  block_number: number;
  block_hash?: string;
  gas_used?: string;
  gas_price?: string;
  transaction_fee?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'failed';
  confirmation_count?: number;
  is_confirmed?: boolean;
  
  // Metadata
  function_name?: string;            // Smart contract function called
  function_args?: Record<string, any>; // JSONB
  logs?: Record<string, any>[];      // JSONB
  
  // Explorer URL
  explorer_url?: string;
  
  // Timestamps
  created_at: string;                // ISO timestamp
  updated_at: string;                // ISO timestamp
  confirmed_at?: string;             // ISO timestamp
}

// Consultant interface matching consultants table
export interface Consultant {
  id: string;                        // UUID
  wallet_address: string;
  name: string;
  title?: string;
  bio?: string;
  expertise?: string[];              // Array of strings
  hourly_rate: number;
  min_duration_hours?: number;       // Default 1
  max_duration_hours?: number;       // Default 8
  rating?: number;                   // Decimal (3,2)
  total_sessions?: number;           // Default 0
  total_hours?: number;              // Default 0
  total_earnings?: number;           // Decimal (20,2)
  is_verified?: boolean;             // Default false
  is_active?: boolean;               // Default true
  verification_level?: string;       // 'pending', 'reviewing', 'verified', 'rejected'
  languages?: string[];              // Array of strings
  availability?: Record<string, any>; // JSONB
  created_at: string;                // ISO timestamp
  updated_at: string;                // ISO timestamp
}

// Profile interface matching profiles table
export interface Profile {
  id: string;                        // UUID
  wallet_address: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;                // ISO timestamp
  updated_at: string;                // ISO timestamp
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  meta?: {
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    statistics?: Record<string, number>;
  };
}

// ============================================
// PAYMENT INTENT RESPONSE
// ============================================

export interface StripePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: string;
  consultationId?: string;
}

// ============================================
// ESCROW CONTRACT SESSION RESPONSE
// ============================================

export interface EscrowSessionResponse {
  success: boolean;
  consultationId: string;
  contractAddress: string;
  amount: number;
  currency: CryptoCurrency;
  network: BlockchainNetwork;
  contractConfig: {
    address: string;
    abi: any[];
    functionName: string;
    args: any[];
    value: bigint; // in wei
  };
}