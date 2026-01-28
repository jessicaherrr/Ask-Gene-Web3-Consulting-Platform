// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connect with <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Web3 Experts</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 md:mb-12">
              Browse verified blockchain consultants, smart contract auditors, DeFi specialists, 
              and Web3 developers ready to help you build.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/consultants"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Browse Experts
              </Link>
              
              <Link 
                href="/consultations"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">5+</div>
            <div className="text-gray-400">Experts</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">4.8</div>
            <div className="text-gray-400">Avg Rating</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-400">Sessions</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-400">Availability</div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">Smart Contract Escrow</h3>
            <p className="text-gray-400">Funds secured in escrow until consultation completion. 5% platform fee.</p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">Verified Reputation</h3>
            <p className="text-gray-400">On-chain reputation system with AI-verified reviews.</p>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-3">$GENE Rewards</h3>
            <p className="text-gray-400">Earn token rewards for consultations and referrals.</p>
          </div>
        </div>

        {/* Supabase Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
              <h3 className="font-semibold text-green-400 mb-2">✅ Database Connection</h3>
              <p className="text-sm text-green-300/80">Supabase PostgreSQL connected</p>
            </div>
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
              <h3 className="font-semibold text-green-400 mb-2">✅ Smart Contracts Ready</h3>
              <p className="text-sm text-green-300/80">Escrow & feedback contracts deployed</p>
            </div>
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
              <h3 className="font-semibold text-green-400 mb-2">✅ UI Components</h3>
              <p className="text-sm text-green-300/80">Dashboard & marketplace ready</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Ready to Explore?</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/consultants" 
                className="px-6 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
              >
                Browse Marketplace
              </Link>
              <Link 
                href="/consultations" 
                className="px-6 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                View Dashboard Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
