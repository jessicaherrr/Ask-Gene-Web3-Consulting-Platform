-- ============================================
-- CONSULTATION PLATFORM DATABASE SCHEMA v3.0
-- WITH STRIPE + CRYPTO PAYMENT INTEGRATION
-- ============================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. PROFILES TABLE (User profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON COLUMN profiles.wallet_address IS 'User wallet address (unique)';

-- ============================================
-- 3. CONSULTANTS TABLE (Experts/Consultants)
-- ============================================
CREATE TABLE IF NOT EXISTS consultants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  bio TEXT,
  expertise TEXT[],
  hourly_rate DECIMAL(10,2) NOT NULL,
  min_duration_hours INTEGER DEFAULT 1,
  max_duration_hours INTEGER DEFAULT 8,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_hours INTEGER DEFAULT 0,
  total_earnings DECIMAL(20,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_level VARCHAR(50) DEFAULT 'pending',
  languages VARCHAR(100)[],
  availability JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE consultants IS 'Experts/Consultants information';
COMMENT ON COLUMN consultants.is_verified IS 'Whether verified by platform';
COMMENT ON COLUMN consultants.verification_level IS 'Verification level: pending/reviewing/verified/rejected';
COMMENT ON COLUMN consultants.expertise IS 'Array of expertise areas';
COMMENT ON COLUMN consultants.availability IS 'JSON containing availability schedule';

-- ============================================
-- 4. CONSULTATIONS TABLE (Consultation bookings)
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultant_id UUID REFERENCES consultants(id) NOT NULL,
  client_wallet_address VARCHAR(42) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(20,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  currency VARCHAR(10) DEFAULT 'USD',
  meeting_link TEXT,
  notes TEXT,
  
  -- Stripe payment fields
  stripe_payment_intent_id VARCHAR(100),
  stripe_session_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  
  -- Crypto payment fields
  crypto_transaction_hash VARCHAR(100),
  crypto_payment_address VARCHAR(42),
  crypto_currency VARCHAR(10) DEFAULT 'MATIC',
  crypto_amount VARCHAR(100),
  network VARCHAR(50) DEFAULT 'polygon',
  contract_session_id VARCHAR(100),
  contract_address VARCHAR(42),
  gas_used VARCHAR(50),
  block_number INTEGER,
  blockchain_explorer_url TEXT,
  
  -- Common payment fields
  payment_id VARCHAR(100),
  payment_method VARCHAR(20) DEFAULT 'crypto',
  refund_id VARCHAR(100),
  cancellation_reason TEXT,
  cancelled_by VARCHAR(50),
  
  -- Google Calendar integration
  google_calendar_event_id VARCHAR(100),
  google_meet_link TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation status constraints
ALTER TABLE consultations 
  ADD CONSTRAINT check_consultation_status 
  CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- Payment status constraints (supports both Stripe and Crypto)
ALTER TABLE consultations 
  ADD CONSTRAINT check_payment_status 
  CHECK (payment_status IN (
    'unpaid',              -- Initial state, no payment made
    'pending',             -- Payment initiated but not confirmed (both Stripe and Crypto)
    'processing',          -- Crypto: transaction sent but not yet confirmed
    'confirming',          -- Crypto: transaction has some confirmations
    'succeeded',           -- Payment successful (Stripe/Crypto)
    'failed',              -- Payment failed
    'refunded',            -- Payment refunded
    'cancelled'            -- Payment cancelled
  ));

-- Payment method constraints
ALTER TABLE consultations 
  ADD CONSTRAINT check_payment_method 
  CHECK (payment_method IN ('crypto', 'stripe'));


-- Comments for consultations table
COMMENT ON TABLE consultations IS 'Consultation booking records';
COMMENT ON COLUMN consultations.status IS 'Consultation status: pending/confirmed/in_progress/completed/cancelled';
COMMENT ON COLUMN consultations.payment_status IS 'Payment status: unpaid/pending/processing/confirming/succeeded/failed/refunded/cancelled';
COMMENT ON COLUMN consultations.payment_method IS 'Payment method: crypto for blockchain payments, stripe for credit card payments';

-- Stripe payment comments
COMMENT ON COLUMN consultations.stripe_payment_intent_id IS 'Stripe payment intent ID for Stripe payments';
COMMENT ON COLUMN consultations.stripe_session_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN consultations.stripe_customer_id IS 'Stripe customer ID for recurring payments';

-- Crypto payment comments
COMMENT ON COLUMN consultations.crypto_transaction_hash IS 'Blockchain transaction hash (e.g., 0x...)';
COMMENT ON COLUMN consultations.crypto_payment_address IS 'Wallet address that received the crypto payment';
COMMENT ON COLUMN consultations.crypto_currency IS 'Cryptocurrency used: MATIC, ETH, USDC, etc';
COMMENT ON COLUMN consultations.crypto_amount IS 'Amount in cryptocurrency (as string to preserve precision)';
COMMENT ON COLUMN consultations.network IS 'Blockchain network: polygon, ethereum, arbitrum, etc';
COMMENT ON COLUMN consultations.contract_session_id IS 'Smart contract session ID from ConsultingSession.sol';
COMMENT ON COLUMN consultations.contract_address IS 'Deployed smart contract address (escrow contract)';
COMMENT ON COLUMN consultations.gas_used IS 'Gas used for the blockchain transaction';
COMMENT ON COLUMN consultations.block_number IS 'Block number where transaction was confirmed';
COMMENT ON COLUMN consultations.blockchain_explorer_url IS 'URL to view transaction on blockchain explorer';

-- Common fields comments
COMMENT ON COLUMN consultations.payment_id IS 'Universal payment ID (Stripe payment intent ID or crypto transaction hash)';
COMMENT ON COLUMN consultations.refund_id IS 'Refund transaction ID (if applicable)';
COMMENT ON COLUMN consultations.cancellation_reason IS 'Reason for consultation cancellation';
COMMENT ON COLUMN consultations.cancelled_by IS 'Who cancelled the consultation: client or consultant';

-- Google Calendar comments
COMMENT ON COLUMN consultations.google_calendar_event_id IS 'Google Calendar event ID for automated scheduling';
COMMENT ON COLUMN consultations.google_meet_link IS 'Google Meet video conference link';

-- ============================================
-- 5. FEEDBACK TABLE (Consultation feedback)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) NOT NULL,
  consultant_id UUID REFERENCES consultants(id) NOT NULL,
  client_wallet_address VARCHAR(42) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  ai_processed BOOLEAN DEFAULT FALSE,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE feedback IS 'Consultation feedback and ratings';
COMMENT ON COLUMN feedback.ai_processed IS 'Whether processed by AI';
COMMENT ON COLUMN feedback.ai_summary IS 'AI-generated feedback summary';

-- ============================================
-- 6. PAYMENT_RECORDS TABLE (Payment transactions audit)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  
  -- Payment Information
  payment_method VARCHAR(20) NOT NULL,
  payment_provider VARCHAR(20),
  provider_payment_id VARCHAR(100) NOT NULL,
  
  -- Financial Details
  amount DECIMAL(10, 2) NOT NULL,
  crypto_amount VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'USD',
  crypto_currency VARCHAR(10),
  
  -- Blockchain Details (for crypto payments)
  transaction_hash VARCHAR(100),
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  network VARCHAR(50),
  gas_used VARCHAR(50),
  block_number INTEGER,
  
  -- Status and Metadata
  status VARCHAR(20) NOT NULL,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE payment_records IS 'Payment transaction records for audit trail';
COMMENT ON COLUMN payment_records.payment_method IS 'Payment method: stripe or crypto';
COMMENT ON COLUMN payment_records.payment_provider IS 'Payment provider: stripe, polygon, ethereum';
COMMENT ON COLUMN payment_records.provider_payment_id IS 'External payment ID: Stripe payment intent ID or blockchain transaction hash';
COMMENT ON COLUMN payment_records.crypto_amount IS 'Amount in cryptocurrency (as string)';
COMMENT ON COLUMN payment_records.crypto_currency IS 'Cryptocurrency code: MATIC, ETH, USDC, etc';
COMMENT ON COLUMN payment_records.transaction_hash IS 'Blockchain transaction hash (for crypto payments)';
COMMENT ON COLUMN payment_records.from_address IS 'Sender wallet address (for crypto payments)';
COMMENT ON COLUMN payment_records.to_address IS 'Receiver wallet address (for crypto payments)';
COMMENT ON COLUMN payment_records.network IS 'Blockchain network: polygon, ethereum, etc';
COMMENT ON COLUMN payment_records.gas_used IS 'Gas used for transaction';
COMMENT ON COLUMN payment_records.block_number IS 'Block number where transaction was mined';
COMMENT ON COLUMN payment_records.metadata IS 'Additional payment details in JSON format';

-- ============================================
-- 7. CRYPTO_TRANSACTIONS TABLE (Blockchain transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_hash VARCHAR(100) UNIQUE NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  contract_address VARCHAR(42),
  
  -- Amount and Token Details
  value VARCHAR(100) NOT NULL,
  token_address VARCHAR(42),
  token_symbol VARCHAR(20),
  token_decimals INTEGER,
  
  -- Blockchain Details
  network VARCHAR(50) NOT NULL,
  chain_id INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  block_hash VARCHAR(100),
  gas_used VARCHAR(50),
  gas_price VARCHAR(50),
  transaction_fee VARCHAR(100),
  
  -- Status
  status VARCHAR(20) NOT NULL,
  confirmation_count INTEGER DEFAULT 0,
  is_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  function_name VARCHAR(100),
  function_args JSONB,
  logs JSONB,
  
  -- Explorer URL
  explorer_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE crypto_transactions IS 'Detailed blockchain transaction records';
COMMENT ON COLUMN crypto_transactions.transaction_hash IS 'Unique blockchain transaction hash';
COMMENT ON COLUMN crypto_transactions.from_address IS 'Sender wallet address';
COMMENT ON COLUMN crypto_transactions.to_address IS 'Receiver wallet address';
COMMENT ON COLUMN crypto_transactions.contract_address IS 'Smart contract address (if interacting with contract)';
COMMENT ON COLUMN crypto_transactions.value IS 'Transaction value in wei/ smallest unit (as string)';
COMMENT ON COLUMN crypto_transactions.token_address IS 'ERC20 token contract address (if token transfer)';
COMMENT ON COLUMN crypto_transactions.token_symbol IS 'Token symbol: MATIC, USDC, etc';
COMMENT ON COLUMN crypto_transactions.token_decimals IS 'Token decimals';
COMMENT ON COLUMN crypto_transactions.network IS 'Blockchain network: polygon, ethereum';
COMMENT ON COLUMN crypto_transactions.chain_id IS 'Chain ID: 137 for Polygon Mainnet, 80002 for Polygon Amoy';
COMMENT ON COLUMN crypto_transactions.gas_used IS 'Gas used in wei';
COMMENT ON COLUMN crypto_transactions.gas_price IS 'Gas price in wei';
COMMENT ON COLUMN crypto_transactions.transaction_fee IS 'Total transaction fee (gas_used * gas_price)';
COMMENT ON COLUMN crypto_transactions.status IS 'Transaction status: pending, confirmed, failed';
COMMENT ON COLUMN crypto_transactions.confirmation_count IS 'Number of block confirmations';
COMMENT ON COLUMN crypto_transactions.function_name IS 'Smart contract function called (if any)';
COMMENT ON COLUMN crypto_transactions.function_args IS 'Function arguments in JSON format';
COMMENT ON COLUMN crypto_transactions.logs IS 'Transaction event logs';
COMMENT ON COLUMN crypto_transactions.explorer_url IS 'Block explorer URL for this transaction';

-- ============================================
-- 8. GOOGLE_CALENDAR_TOKENS TABLE (OAuth2 tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Token Information
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE google_calendar_tokens IS 'OAuth2 tokens for Google Calendar integration';
COMMENT ON COLUMN google_calendar_tokens.access_token IS 'Google OAuth2 access token';
COMMENT ON COLUMN google_calendar_tokens.refresh_token IS 'Google OAuth2 refresh token';
COMMENT ON COLUMN google_calendar_tokens.expiry_date IS 'Token expiration timestamp';

-- ============================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address);

-- Consultants table indexes
CREATE INDEX IF NOT EXISTS idx_consultants_wallet ON consultants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_consultants_verified ON consultants(is_verified, is_active, rating DESC);
CREATE INDEX IF NOT EXISTS idx_consultants_expertise ON consultants USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_consultants_rate ON consultants(hourly_rate);

-- Consultations table indexes
CREATE INDEX IF NOT EXISTS idx_consultations_client ON consultations(client_wallet_address);
CREATE INDEX IF NOT EXISTS idx_consultations_consultant ON consultations(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(scheduled_for DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_payment_method ON consultations(payment_method);
CREATE INDEX IF NOT EXISTS idx_consultations_payment_status ON consultations(payment_status);
CREATE INDEX IF NOT EXISTS idx_consultations_updated_at ON consultations(updated_at DESC);

-- Stripe payment indexes
CREATE INDEX IF NOT EXISTS idx_consultations_stripe_payment_intent ON consultations(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_consultations_stripe_session ON consultations(stripe_session_id);

-- Crypto payment indexes
CREATE INDEX IF NOT EXISTS idx_consultations_crypto_tx_hash ON consultations(crypto_transaction_hash);
CREATE INDEX IF NOT EXISTS idx_consultations_contract_session ON consultations(contract_session_id);
CREATE INDEX IF NOT EXISTS idx_consultations_block_number ON consultations(block_number);

-- Feedback table indexes
CREATE INDEX IF NOT EXISTS idx_feedback_consultant ON feedback(consultant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

-- Payment records indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_consultation_id ON payment_records(consultation_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_provider_id ON payment_records(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON payment_records(created_at DESC);

-- Crypto transactions indexes
CREATE INDEX IF NOT EXISTS idx_crypto_tx_hash ON crypto_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_tx_from ON crypto_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_crypto_tx_to ON crypto_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_crypto_tx_network ON crypto_transactions(network);
CREATE INDEX IF NOT EXISTS idx_crypto_tx_block ON crypto_transactions(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_tx_status ON crypto_transactions(status);
CREATE INDEX IF NOT EXISTS idx_crypto_tx_confirmed ON crypto_transactions(is_confirmed);

-- Google calendar tokens indexes
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_id ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_tokens_expiry ON google_calendar_tokens(expiry_date);

-- ============================================
-- 10. CREATE TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultants_updated_at 
    BEFORE UPDATE ON consultants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at 
    BEFORE UPDATE ON consultations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at 
    BEFORE UPDATE ON payment_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_transactions_updated_at 
    BEFORE UPDATE ON crypto_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_tokens_updated_at 
    BEFORE UPDATE ON google_calendar_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. SAMPLE DATA FOR TESTING 
-- ============================================

-- Sample consultant data (optional, remove in production)

INSERT INTO consultants (
  wallet_address,
  name,
  title,
  bio,
  expertise,
  hourly_rate,
  min_duration_hours,
  max_duration_hours,
  rating,
  total_sessions,
  total_hours,
  total_earnings,
  is_verified,
  is_active,
  verification_level,
  languages,
  availability
) VALUES 
(
  '0x742d35Cc6634C0532925a3b844Bc9e0BB7d5C8c1', -- 42 chars ✓
  'Alex Johnson',
  'Senior Web3 Developer',
  '5+ years experience in Solidity and smart contract development.',
  ARRAY['Solidity', 'Smart Contracts', 'DeFi', 'NFT', 'Ethereum'],
  150.00,
  1,
  4,
  4.8,
  47,
  89,
  13350.00,
  TRUE,
  TRUE,
  'verified',
  ARRAY['English', 'Spanish'],
  '{"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"], "wednesday": ["09:00-17:00"], "thursday": ["09:00-17:00"], "friday": ["09:00-15:00"]}'
),
(
  '0x8a2d35Cc6634C0532925a3b844Bc9e0BB7d5C8c2', -- 42 chars ✓
  'Maria Chen',
  'Blockchain Security Auditor',
  'Specialized in smart contract security audits.',
  ARRAY['Security', 'Auditing', 'Penetration Testing', 'Smart Contracts'],
  200.00,
  1,
  3,
  4.9,
  32,
  64,
  12800.00,
  TRUE,
  TRUE,
  'verified',
  ARRAY['English', 'Mandarin'],
  '{"monday": ["10:00-18:00"], "tuesday": ["10:00-18:00"], "wednesday": ["10:00-18:00"], "thursday": ["10:00-18:00"], "friday": ["10:00-16:00"]}'
),
(
  '0x5b3d35Cc6634C0532925a3b844Bc9e0BB7d5C8c3', -- 42 chars ✓
  'David Rodriguez',
  'DeFi Protocol Architect',
  'Architected multiple successful DeFi protocols.',
  ARRAY['DeFi', 'Tokenomics', 'Yield Farming', 'Liquidity Pools'],
  180.00,
  1,
  5,
  4.7,
  28,
  70,
  12600.00,
  TRUE,
  TRUE,
  'verified',
  ARRAY['English', 'Portuguese'],
  '{"monday": ["08:00-16:00"], "tuesday": ["08:00-16:00"], "wednesday": ["08:00-16:00"], "thursday": ["08:00-16:00"], "friday": ["08:00-12:00"]}'
),
(
  '0x9c1d35Cc6634C0532925a3b844Bc9e0BB7d5C8c4', -- 42 chars ✓
  'Sarah Williams',
  'NFT & Metaverse Strategist',
  'Helped launch 50+ successful NFT projects.',
  ARRAY['NFT', 'Metaverse', 'Community', 'Marketing'],
  120.00,
  1,
  3,
  4.6,
  65,
  130,
  15600.00,
  TRUE,
  TRUE,
  'verified',
  ARRAY['English', 'French'],
  '{"monday": ["11:00-19:00"], "tuesday": ["11:00-19:00"], "wednesday": ["11:00-19:00"], "thursday": ["11:00-19:00"], "saturday": ["10:00-14:00"]}'
),
(
  '0x3e2d35Cc6634C0532925a3b844Bc9e0BB7d5C8c5', -- 42 chars ✓
  'James Kim',
  'Web3 Full Stack Developer',
  'Full stack developer specializing in dApp frontends.',
  ARRAY['React', 'Next.js', 'Web3.js', 'Ethers.js'],
  130.00,
  1,
  6,
  4.5,
  42,
  126,
  16380.00,
  TRUE,
  TRUE,
  'verified',
  ARRAY['English', 'Korean'],
  '{"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"], "wednesday": ["09:00-17:00"], "thursday": ["09:00-17:00"], "friday": ["09:00-13:00"]}'
);

-- ============================================
-- ADD TEST PROFILES 
-- ============================================

INSERT INTO profiles (
  wallet_address,
  name,
  email,
  bio,
  avatar_url
) VALUES 
(
  '0x742d35Cc6634C0532925a3b844Bc9e0BB7d5C8c1', -- 42 chars ✓
  'Alex Johnson',
  'alex@web3consulting.com',
  'Senior Web3 Developer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
),
(
  '0x8a2d35Cc6634C0532925a3b844Bc9e0BB7d5C8c2', -- 42 chars ✓
  'Maria Chen',
  'maria@blockchainsecurity.com',
  'Blockchain Security Auditor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
),
(
  '0x5b3d35Cc6634C0532925a3b844Bc9e0BB7d5C8c3', -- 42 chars ✓
  'David Rodriguez',
  'david@defiarchitect.com',
  'DeFi Protocol Architect',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
),
(
  '0x9c1d35Cc6634C0532925a3b844Bc9e0BB7d5C8c4', -- 42 chars ✓
  'Sarah Williams',
  'sarah@nftstrategist.com',
  'NFT & Metaverse Strategist',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
),
(
  '0x3e2d35Cc6634C0532925a3b844Bc9e0BB7d5C8c5', -- 42 chars ✓
  'James Kim',
  'james@web3fullstack.com',
  'Web3 Full Stack Developer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
);

-- ============================================
-- ADD TEST CONSULTATIONS
-- ============================================

-- First, let's verify all client addresses are 42 chars
-- Creating a function to ensure 42-char addresses
DO $$
DECLARE
  client_address_1 VARCHAR(42) := '0xC111111111111111111111111111111111111111';
  client_address_2 VARCHAR(42) := '0xC222222222222222222222222222222222222222';
  client_address_3 VARCHAR(42) := '0xC333333333333333333333333333333333333333';
  client_address_4 VARCHAR(42) := '0xC444444444444444444444444444444444444444';
  client_address_5 VARCHAR(42) := '0xC555555555555555555555555555555555555555';
BEGIN
  -- For Alex Johnson
  INSERT INTO consultations (
    consultant_id,
    client_wallet_address,
    title,
    description,
    scheduled_for,
    duration_hours,
    hourly_rate,
    total_amount,
    status,
    payment_status,
    meeting_link,
    stripe_payment_intent_id
  )
  SELECT 
    id,
    client_address_1,
    'Smart Contract Code Review',
    'Need help reviewing my DeFi protocol smart contracts for security vulnerabilities.',
    NOW() + INTERVAL '2 days',
    2,
    150.00,
    300.00,
    'confirmed',
    'succeeded',
    'https://meet.google.com/abc-defg-hij',
    'pi_test_123456'
  FROM consultants WHERE name = 'Alex Johnson';

  -- For Maria Chen
  INSERT INTO consultations (
    consultant_id,
    client_wallet_address,
    title,
    description,
    scheduled_for,
    duration_hours,
    hourly_rate,
    total_amount,
    status,
    payment_status
  )
  SELECT 
    id,
    client_address_2,
    'Security Audit Consultation',
    'Need security audit for my new DeFi protocol.',
    NOW() + INTERVAL '3 days',
    1,
    200.00,
    200.00,
    'pending',
    'pending'
  FROM consultants WHERE name = 'Maria Chen';

  -- For David Rodriguez
  INSERT INTO consultations (
    consultant_id,
    client_wallet_address,
    title,
    description,
    scheduled_for,
    duration_hours,
    hourly_rate,
    total_amount,
    status,
    payment_status
  )
  SELECT 
    id,
    client_address_3,
    'DeFi Protocol Design',
    'Looking for help designing a new AMM protocol.',
    NOW() + INTERVAL '4 days',
    2,
    180.00,
    360.00,
    'confirmed',
    'succeeded'
  FROM consultants WHERE name = 'David Rodriguez';

  -- For Sarah Williams
  INSERT INTO consultations (
    consultant_id,
    client_wallet_address,
    title,
    description,
    scheduled_for,
    duration_hours,
    hourly_rate,
    total_amount,
    status,
    payment_status
  )
  SELECT 
    id,
    client_address_4,
    'NFT Launch Strategy',
    'Planning to launch an NFT collection, need marketing strategy.',
    NOW() + INTERVAL '5 days',
    1.5,
    120.00,
    180.00,
    'completed',
    'succeeded'
  FROM consultants WHERE name = 'Sarah Williams';

  -- For James Kim
  INSERT INTO consultations (
    consultant_id,
    client_wallet_address,
    title,
    description,
    scheduled_for,
    duration_hours,
    hourly_rate,
    total_amount,
    status,
    payment_status
  )
  SELECT 
    id,
    client_address_5,
    'dApp Development Help',
    'Need help building frontend for my blockchain project.',
    NOW() + INTERVAL '6 days',
    3,
    130.00,
    390.00,
    'cancelled',
    'refunded'
  FROM consultants WHERE name = 'James Kim';

  RAISE NOTICE '✅ All consultations inserted successfully';
END $$;


-- FINAL SUCCESS MESSAGE

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM consultants WHERE LENGTH(wallet_address) != 42
    UNION ALL
    SELECT 1 FROM profiles WHERE LENGTH(wallet_address) != 42
    UNION ALL
    SELECT 1 FROM consultations WHERE LENGTH(client_wallet_address) != 42
  ) THEN
    RAISE NOTICE '✅ SUCCESS: All test data inserted correctly!';
    RAISE NOTICE '   - Consultants: %', (SELECT COUNT(*) FROM consultants);
    RAISE NOTICE '   - Profiles: %', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE '   - Consultations: %', (SELECT COUNT(*) FROM consultations);
  ELSE
    RAISE NOTICE '❌ ERROR: Some addresses have incorrect length';
  END IF;
END $$;

-- ============================================
-- 12. VERIFICATION QUERIES
-- ============================================

-- Verify table creation
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 
    'consultants', 
    'consultations', 
    'feedback', 
    'payment_records', 
    'crypto_transactions', 
    'google_calendar_tokens'
  )
ORDER BY table_name;

-- Verify constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('consultations')
ORDER BY tc.table_name, tc.constraint_type;

-- Verify indexes
SELECT 
  COUNT(*) as total_indexes,
  STRING_AGG(indexname, ', ') as index_names
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 
    'consultants', 
    'consultations', 
    'feedback', 
    'payment_records', 
    'crypto_transactions', 
    'google_calendar_tokens'
  );