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