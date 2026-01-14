// components/common/WalletInfo.tsx
'use client';

import { useAccount, useBalance, useDisconnect, useEnsName, useEnsAvatar } from 'wagmi';
import { polygonAmoyConfig } from '@/lib/blockchain/config';

export default function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const { data: balance } = useBalance({
    address,
    chainId: polygonAmoyConfig.id,
  });
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) {
    return null;
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Wallet Information</h3>
        <button
          onClick={() => disconnect()}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="space-y-4">
        {/* Wallet Address */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            {ensAvatar ? (
              <img
                src={ensAvatar}
                alt="ENS Avatar"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-white text-lg">👛</span>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-400">Wallet Address</div>
            <div className="font-mono text-white">{ensName || shortAddress}</div>
          </div>
        </div>

        {/* Network */}
        <div>
          <div className="text-sm text-gray-400">Network</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white">{chain?.name || 'Polygon Amoy'}</span>
          </div>
        </div>

        {/* Balance */}
        <div>
          <div className="text-sm text-gray-400">Balance</div>
          <div className="flex items-center space-x-2">
            <div className="text-xl font-bold text-white">
              {balance?.formatted.slice(0, 8)} {balance?.symbol}
            </div>
            <div className="text-sm text-gray-400">(${balance?.formatted ? '--' : '0.00'})</div>
          </div>
        </div>

        {/* Chain ID */}
        <div>
          <div className="text-sm text-gray-400">Chain ID</div>
          <div className="font-mono text-white">{chain?.id || polygonAmoyConfig.id}</div>
        </div>
      </div>
    </div>
  );
}
