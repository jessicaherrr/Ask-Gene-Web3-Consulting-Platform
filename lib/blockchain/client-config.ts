// lib/blockchain/client-config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoyConfig } from './config';
import { http } from 'wagmi';

/**
 * Client-side only configuration for Wagmi and RainbowKit
 * This should ONLY be imported in client components
 */
export const clientConfig = getDefaultConfig({
  appName: 'AskGene Web3',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [polygonAmoyConfig as any],
  transports: {
    [polygonAmoyConfig.id]: http(),
  },
  ssr: true, // Required for Next.js server-side rendering
});