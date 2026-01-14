// components/common/WalletConnectButton.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { polygonAmoyConfig } from '@/lib/blockchain/config';

export default function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: polygonAmoyConfig.id,
  });

  // Custom connect button for better UI integration
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain: connectedChain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && connectedChain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (connectedChain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    type="button"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-full transition-colors duration-200"
                    type="button"
                  >
                    {connectedChain.hasIcon && (
                      <div className="w-4 h-4">
                        {connectedChain.iconUrl && (
                          <img
                            alt={connectedChain.name ?? 'Chain icon'}
                            src={connectedChain.iconUrl}
                            className="w-4 h-4 rounded-full"
                          />
                        )}
                      </div>
                    )}
                    {connectedChain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-sm">👛</span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">
                          {account.displayName}
                        </div>
                        <div className="text-xs opacity-80">
                          {balance?.formatted.slice(0, 6)} {balance?.symbol}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}