// components/providers/index.tsx
'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

// Import from the NEW client-config file instead
import { clientConfig } from '@/lib/blockchain/client-config'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <WagmiProvider config={clientConfig}>  {/* ← Use clientConfig here */}
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#6366f1', // Using Indigo color
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          coolMode
          appInfo={{
            appName: 'AskGene Web3',
            learnMoreUrl: 'https://docs.askgene.com',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}