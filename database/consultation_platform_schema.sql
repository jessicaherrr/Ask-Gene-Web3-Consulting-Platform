[?25l[?2004h
                                                                                                
  >  1. vbhwudyvjpgtbzvybxrx [name: Ask Gene Web3, org: jpihyonwcvirzaiyzuuc, region: us-west-2]
                                                                                                
                                                                                                
    ↑/k up • ↓/j down • / filter • q quit • ? more                                              
                                                                                                [6A [J[2K[?2004l[?25h[?1002l[?1003l[?1006l-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table (User profiles)
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

-- Add comments
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON COLUMN profiles.wallet_address IS 'User wallet address (unique)';

-- 3. Create consultants table (Experts/Consultants)
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

-- Add comments
COMMENT ON TABLE consultants IS 'Experts/Consultants information';
COMMENT ON COLUMN consultants.is_verified IS 'Whether verified by platform';
COMMENT ON COLUMN consultants.verification_level IS 'Verification level: pending/reviewing/verified/rejected';
COMMENT ON COLUMN consultants.expertise IS 'Array of expertise areas';
COMMENT ON COLUMN consultants.availability IS 'JSON containing availability schedule';

-- 4. Create consultations table (Consultation bookings)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints for status values
ALTER TABLE consultations 
  ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE consultations 
  ADD CONSTRAINT check_payment_status 
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'cancelled'));

-- Add comments
COMMENT ON TABLE consultations IS 'Consultation booking records';
COMMENT ON COLUMN consultations.status IS 'Consultation status: pending/confirmed/in_progress/completed/cancelled';
COMMENT ON COLUMN consultations.payment_status IS 'Payment status: unpaid/paid/refunded/cancelled';

-- 5. Create feedback table (Consultation feedback)
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

-- Add comments
COMMENT ON TABLE feedback IS 'Consultation feedback and ratings';
COMMENT ON COLUMN feedback.ai_processed IS 'Whether processed by AI';
COMMENT ON COLUMN feedback.ai_summary IS 'AI-generated feedback summary';

-- 6. Create indexes for better performance
-- Indexes for consultants table
CREATE INDEX IF NOT EXISTS idx_consultants_wallet ON consultants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_consultants_verified ON consultants(is_verified, is_active, rating DESC);
CREATE INDEX IF NOT EXISTS idx_consultants_expertise ON consultants USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_consultants_rate ON consultants(hourly_rate);

-- Indexes for consultations table
CREATE INDEX IF NOT EXISTS idx_consultations_client ON consultations(client_wallet_address);
CREATE INDEX IF NOT EXISTS idx_consultations_consultant ON consultations(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(scheduled_for DESC);

-- Indexes for feedback table
CREATE INDEX IF NOT EXISTS idx_feedback_consultant ON feedback(consultant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
