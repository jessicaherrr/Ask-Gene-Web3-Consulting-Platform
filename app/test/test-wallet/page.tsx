// app/test-wallet/page.tsx
'use client';

import WalletInfo from '@/components/common/WalletInfo';
import WalletConnectButton from '@/components/common/WalletConnectButton';
import { useAccount } from 'wagmi';

export default function TestWalletPage() {
  const { isConnected, address } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Wallet Integration Test
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Connection Status */}
        <div className="bg-gray-800/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Connection Status</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          {isConnected ? (
            <div className="space-y-2">
              <div className="font-mono text-sm bg-gray-900/50 p-3 rounded-lg">
                {address}
              </div>
              <p className="text-gray-400 text-sm">
                Your wallet is successfully connected to Polygon Amoy testnet.
              </p>
            </div>
          ) : (
            <p className="text-gray-400">
              Please connect your wallet to continue.
            </p>
          )}
        </div>

        {/* Connect Button Test */}
        <div className="bg-gray-800/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Connect Button</h2>
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </div>

        {/* Wallet Information */}
        {isConnected && (
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
            <WalletInfo />
          </div>
        )}

        {/* Test Instructions */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">
            Testing Instructions
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click "Connect Wallet" button</li>
            <li>Choose your wallet (MetaMask, Rainbow, etc.)</li>
            <li>Approve connection request in your wallet</li>
            <li>Switch to Polygon Amoy network if prompted</li>
            <li>Verify your wallet information displays correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}