# Ask-Gene-Web3-Consulting-Platform
#Web3 #SmartContracts #Solidity #Polygon #DeFi #dApp #BlockchainDevelopment #Ethereum #CryptoPayments #OnChainReputation

## Project Overview
Ask Gene is a decentralized consulting platform built on Polygon blockchain that enables secure escrow payments and AI-powered feedback verification. The platform connects clients with verified consultants through smart contract-based sessions.

## Key Features
### Smart Contract Escrow System
- ConsultingSession.sol: Manages session lifecycle from creation to payment release
- FeedbackStorage.sol: Stores hashed feedback immutably on-chain
- Automated Payments: Release funds upon session completion with AI-verified feedback
- Refund Mechanism: Time-based refunds for unconfirmed or incomplete sessions

### AI-Powered Feedback Verification
- On-chain storage of feedback hashes
- AI processing for feedback authenticity
- Reputation system based on verified reviews
- Immutable feedback history for consultants

### Full-Stack Architecture
- Frontend: Next.js 15 with TypeScript and Tailwind CSS
- Backend: Supabase for data management and authentication
- Blockchain: Polygon Amoy testnet with Hardhat development
- Wallet Integration: RainbowKit and Wagmi for Web3 connectivity

## Directory Structure
### app/ - Frontend

### contracts/ - Blockchain
- ConsultingSession.sol - Escrow contract
  - createSession() - Start session with payment
  - releasePayment() - Pay consultant
  - refund() - Return funds
- FeedbackStorage.sol - Store feedback on-chain
- deploy.js - Deploy to Polygon Amoy

### lib/ - Utilities
- blockchain/config.ts - Network settings
- supabase/client.ts - Database connection

### components/ - UI Components
- Consultant cards, booking forms, buttons


## API Documentation
### Consultant Endpoints
- GET /api/consultants - List all verified consultants
- GET /api/consultants/[id] - Get specific consultant details

### Consultation Endpoints
- GET /api/consultations - List user's consultations
- POST /api/consultations - Create new consultation
- PATCH /api/consultations/[id] - Update consultation status

### Feedback Endpoints
- POST /api/feedback - Submit feedback for completed session
- GET /api/feedback/[sessionId] - Get feedback for specific session

