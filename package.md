{
  "name": "ask-gene-web3",
  "version": "0.1.0",
  "private": true,
  "description": "Decentralized consulting platform with escrow payments and AI-powered feedback",
  "author": "Jessica He",
  "license": "MIT",
  "scripts": {
    // Frontend Development
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    
    // Smart Contract Development
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run contracts/scripts/deploy.js",
    "deploy:amoy": "hardhat run contracts/scripts/deploy.js --network polygonAmoy",
    "deploy:local": "hardhat run contracts/scripts/deploy.js --network localhost",
    "node": "hardhat node",
    "verify": "hardhat verify",
    "clean": "hardhat clean",
    
    // Database & Data Management
    "seed": "node scripts/seed-db.js",
    "typegen": "npx supabase gen types typescript --project-id vbhwudyvjpgtbzvybxrx --schema public > lib/supabase/database.types.ts",
    "db:push": "npx supabase db push",
    "db:reset": "npx supabase db reset",
    
    // Utility Scripts
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check-types": "tsc --noEmit",
    "test:all": "npm run test && npm run lint && npm run check-types"
  },
  "dependencies": {
    // Next.js & React Core
    "next": "15.1.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    
    // Blockchain & Wallet Integration
    "@rainbow-me/rainbowkit": "^2.2.10",      // Wallet connection UI
    "wagmi": "^2.19.5",                       // React hooks for Ethereum
    "viem": "^2.43.5",                        // TypeScript interface for Ethereum
    "ethers": "^6.13.5",                      // Ethereum library for contract interaction
    
    // Supabase (Backend-as-a-Service)
    "@supabase/supabase-js": "^2.89.0",       // Supabase JavaScript client
    "@supabase/ssr": "^0.8.0",                // Supabase SSR utilities
    
    // State Management & Data Fetching
    "@tanstack/react-query": "^5.90.16",      // Server state management
    "@tanstack/react-query-devtools": "^5.91.2", // Dev tools for React Query
    
    // UI Components & Styling
    "class-variance-authority": "^0.7.0",     // CSS class composition
    "clsx": "^2.0.0",                         // Conditional className utility
    "tailwind-merge": "^2.2.1",               // Merge Tailwind classes
    "tailwindcss-animate": "^1.0.7",          // Tailwind animation utilities
    "lucide-react": "^0.344.0",               // Icon library
    
    // Utilities & Helpers
    "date-fns": "^4.1.0",                     // Date manipulation library
    "zod": "^3.22.4",                         // TypeScript-first schema validation
    "dotenv": "^17.2.3",                      // Environment variable management
    "node-fetch": "^2.7.0"                    // HTTP client (for API calls)
  },
  "devDependencies": {
    // TypeScript & Type Definitions
    "typescript": "^5.3.3",
    "@types/node": "^20.11.24",
    "@types/react": "^18.2.61",
    "@types/react-dom": "^18.2.19",
    
    // Hardhat (Smart Contract Development)
    "hardhat": "^2.22.19",                    // Ethereum development environment
    "@nomicfoundation/hardhat-toolbox": "^5.0.0", // Hardhat plugin suite
    "@nomicfoundation/hardhat-network-helpers": "^1.0.12", // Network testing utilities
    "@nomicfoundation/hardhat-verify": "^2.0.11", // Contract verification
    "@typechain/hardhat": "^9.1.0",           // TypeScript bindings for contracts
    "@typechain/ethers-v6": "^0.5.1",         // Ethers v6 type generation
    
    // OpenZeppelin Contracts (to be added)
    "@openzeppelin/contracts": "^5.2.0",      // Secure smart contract libraries
    
    // CSS & Styling
    "tailwindcss": "^3.4.1",                  // Utility-first CSS framework
    "autoprefixer": "^10.4.19",               // CSS vendor prefixing
    "postcss": "^8.4.35",                     // CSS transformation tool
    
    // Code Quality & Linting
    "eslint": "^8.57.0",
    "eslint-config-next": "15.1.6",
    
    // Code Formatting (optional - add if needed)
    // "prettier": "^3.2.5",
    // "prettier-plugin-tailwindcss": "^0.5.11"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "keywords": [
    "web3",
    "consulting",
    "blockchain",
    "polygon",
    "smart-contracts",
    "nextjs",
    "supabase",
    "typescript"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/ask-gene-web3.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/ask-gene-web3/issues"
  },
  "homepage": "https://ask-gene.vercel.app"
}