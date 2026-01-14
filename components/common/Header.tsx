// components/common/Header.tsx
'use client';

import Link from 'next/link';
import WalletConnectButton from './WalletConnectButton';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function Header() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Consultants', href: '/consultants' },
    { name: 'My Bookings', href: '/bookings' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AG</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AskGene
              </span>
              <span className="text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full">
                Web3
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  pathname === item.href
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 mt-1 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Testnet</span>
              </div>
            )}
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}