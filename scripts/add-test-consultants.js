// scripts/add-test-consultants.js
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('Please set in .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.log('\n💡 Example:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const testConsultants = [
  {
    wallet_address: '0x4CB749132342Aa9611bC8d10fE413864FF6F3184',
    name: 'Alex Chen',
    title: 'Senior Smart Contract Auditor',
    bio: '5+ years auditing DeFi protocols. Found critical vulnerabilities in top protocols.',
    expertise: ['Solidity', 'Security', 'DeFi', 'EVM'],
    hourly_rate: 350,
    rating: 4.9,
    is_verified: true,
    is_active: true,
  },
  {
    wallet_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    name: 'Maria Garcia',
    title: 'Web3 Product Lead',
    bio: 'Built multiple successful Web3 products from 0 to 1M+ users.',
    expertise: ['Product', 'Tokenomics', 'Go-to-market', 'UX'],
    hourly_rate: 280,
    rating: 4.8,
    is_verified: true,
    is_active: true,
  }
];

async function addTestData() {
  console.log('\n🚀 Starting test data insertion...');
  
  try {
    // 1. First test connection
    console.log('📡 Testing database connection...');
    const { error: testError } = await supabase
      .from('consultants')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.log('\n💡 Possible reasons:');
      console.log('   1. Wrong Supabase URL or API key');
      console.log('   2. Network connection issue');
      console.log('   3. Database tables not created yet');
      console.log('\n✅ First run your SQL in Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Insert test data
    console.log('\n📝 Inserting test consultants...');
    const { data, error } = await supabase
      .from('consultants')
      .upsert(testConsultants, { onConflict: 'wallet_address' });

    if (error) {
      console.error('❌ Insertion error:', error.message);
      console.log('\n💡 Check:');
      console.log('   - Table "consultants" exists');
      console.log('   - Table schema matches your data');
      return;
    }

    // 3. Handle null data response
    if (!data) {
      console.log('⚠️  Insert successful but no data returned');
      console.log('   This can happen with upsert operations');
    } else {
      console.log(`✅ Successfully inserted/updated ${data.length} consultants`);
    }

    // 4. Verify by fetching the data
    console.log('\n🔍 Verifying inserted data...');
    const { data: consultants, error: fetchError } = await supabase
      .from('consultants')
      .select('name, title, hourly_rate, is_verified, wallet_address')
      .in('wallet_address', [
        '0x4CB749132342Aa9611bC8d10fE413864FF6F3184',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F'
      ]);

    if (fetchError) {
      console.error('❌ Verification failed:', fetchError.message);
    } else if (consultants && consultants.length > 0) {
      console.log('✅ Verified consultants in database:');
      consultants.forEach(consultant => {
        console.log(`   • ${consultant.name} - ${consultant.title} ($${consultant.hourly_rate}/hr)`);
        console.log(`     Wallet: ${consultant.wallet_address.substring(0, 10)}...`);
      });
    } else {
      console.log('⚠️  No consultants found with the specified wallet addresses');
    }

    // 5. Show total count
    const { count } = await supabase
      .from('consultants')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Total consultants in database: ${count || 0}`);

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    console.log('\n🔧 Try these steps:');
    console.log('   1. Check your .env.local file');
    console.log('   2. Run: cat .env.local');
    console.log('   3. Make sure tables are created');
    console.log('   4. Check Supabase project is active');
  }
}

// Execute the function
addTestData();