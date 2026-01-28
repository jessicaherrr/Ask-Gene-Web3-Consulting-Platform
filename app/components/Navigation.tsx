// app/components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('1,250');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock wallet connection
  useEffect(() => {
    const mockAddress = '0x742d35Cc6634C0532925a3b8B9C4B1a8f8f3a2b8';
    setWalletAddress(mockAddress);
  }, []);

  const handleConnectWallet = () => {
    alert('Wallet connection would open here');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/consultants' },
    { name: 'My Dashboard', href: '/consultations' },
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'Become Expert', href: '/become-expert' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                <span className="text-xl">🧬</span>
              </div>
              <span className="text-xl font-bold text-white">AskGene Web3</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="ml-10 hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    pathname === link.href ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: Wallet and User Menu */}
          <div className="flex items-center gap-4">
            {/* Token Balance */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2">
              <span className="text-yellow-400">💎</span>
              <span className="font-semibold text-white">{tokenBalance} $GENE</span>
            </div>

            {/* Wallet Button */}
            {walletAddress ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/consultations"
                  className="hidden sm:flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <span className="text-sm"> Dashboard</span>
                </Link>
                <button
                  onClick={handleConnectWallet}
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 hover:bg-gray-700 transition-colors"
                >
                  <span className="text-green-400 text-xs">●</span>
                  <span className="font-medium text-white text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <span>🔗</span>
                <span className="text-sm">Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg ${
                    pathname === link.href 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
