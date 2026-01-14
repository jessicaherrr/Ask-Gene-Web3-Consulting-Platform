// app/consultants/page.tsx
import ConsultantsList from '@/components/consultants/ConsultantsList';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Web3 Consultants - Find Blockchain Experts | AskGene',
  description: 'Browse verified Web3 consultants, smart contract auditors, DeFi experts and blockchain developers.',
};

// 获取咨询顾问数据的服务端函数
async function getConsultants() {
  try {
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching consultants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default async function ConsultantsPage() {
  const consultants = await getConsultants();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Connect with <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Web3 Experts</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Browse verified blockchain consultants, smart contract auditors, DeFi specialists, 
              and Web3 developers ready to help you build.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{consultants.length}+</div>
                <div className="text-sm text-gray-400">Experts</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">4.8</div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-400">Sessions</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400">Availability</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Filter by Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {['All', 'Solidity', 'DeFi', 'Security', 'NFT', 'Tokenomics', 'Smart Contracts', 'DAO'].map((skill) => (
              <button
                key={skill}
                className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Consultants List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Available Consultants</h2>
            <div className="text-gray-400">
              Showing <span className="text-white font-semibold">{consultants.length}</span> experts
            </div>
          </div>
          
          {consultants.length > 0 ? (
            <ConsultantsList consultants={consultants} />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No consultants available yet</div>
              <p className="text-gray-500">Check back soon or add some test data.</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Become a Consultant</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Are you a Web3 expert? Join our platform and start earning by sharing your knowledge.
          </p>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">
            Apply as Consultant
          </button>
        </div>
      </div>
    </div>
  );
}