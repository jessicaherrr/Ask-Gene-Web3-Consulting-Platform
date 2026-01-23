import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'viem/chains';
import { http } from 'wagmi';

// Polygon Amoy Testnet configuration
export const polygonAmoyConfig = {
  id: 80002,
  name: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  testnet: true,
};

// Contract addresses from Week 3 deployment
export const CONSULTING_SESSION_ADDRESS = '0x4dF00c67bB55295347f4e3BA9634ffF8270E9EDe';
export const FEEDBACK_STORAGE_ADDRESS = '0x1c0E8C70dc36555F46c73E4d550A5257ac8A9264';

// Contract ABIs - you need to import these from your artifacts
// For now, let's create a minimal ABI for createSession function
export const CONSULTING_SESSION_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_consultantId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_scheduledTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "createSession",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_sessionId",
        "type": "uint256"
      }
    ],
    "name": "confirmCompletion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_sessionId",
        "type": "uint256"
      }
    ],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Main Wagmi/RainbowKit configuration
export const config = getDefaultConfig({
  appName: 'AskGene Web3',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [polygonAmoyConfig as any], // Use Polygon Amoy testnet
  transports: {
    [polygonAmoyConfig.id]: http(),
  },
  ssr: true, // Required for Next.js SSR
});