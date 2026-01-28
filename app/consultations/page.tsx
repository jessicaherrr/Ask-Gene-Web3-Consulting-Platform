// app/consultations/page.tsx
'use client'; // This is a client component for interactive features

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice, truncateAddress } from '@/lib/supabase';

// Define session type
interface Session {
  id: string;
  title: string;
  consultant_name: string;
  scheduled_for: string;
  duration: number;
  amount: number;
  status: 'upcoming' | 'completed' | 'pending' | 'cancelled';
  consultant_initials: string;
  gradient: string;
  escrow_status: 'escrowed' | 'released' | 'refunded';
  meeting_link?: string;
}

// Define review type
interface Review {
  id: string;
  reviewer_name: string;
  reviewer_initials: string;
  rating: number;
  comment: string;
  created_at: string;
  is_ai_verified: boolean;
  tx_hash?: string;
}

// Define earning stats type
interface Earnings {
  total: number;
  available: number;
  pending: number;
  transactions: any[];
}

// Define NFT badge type
interface NFTBadge {
  id: string;
  name: string;
  description: string;
  earned_date: string;
  rarity: 'gold' | 'silver' | 'bronze' | 'purple';
  token_id: string;
  is_locked: boolean;
  emoji: string;
}

export default function ConsultationsDashboard() {
  // State for active page/tab
  const [activePage, setActivePage] = useState<'sessions' | 'reputation' | 'earnings' | 'nft' | 'settings'>('sessions');
  
  // State for session filter
  const [sessionFilter, setSessionFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');
  
  // State for data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [earnings, setEarnings] = useState<Earnings>({ total: 0, available: 0, pending: 0, transactions: [] });
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>('0x742d...8f3a');
  const [tokenBalance, setTokenBalance] = useState<string>('1,250');

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    
    // Set up real-time subscription for sessions
    const sessionsSubscription = supabase
      .channel('user-sessions-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'consultations',
          filter: `user_id=eq.${'user-id-here'}` // This should be replaced with actual user ID
        }, 
        (payload) => {
          console.log('Session change received!', payload);
          fetchUserData(); // Refresh data
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      sessionsSubscription.unsubscribe();
    };
  }, []);

  // Function to fetch all user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch actual data from Supabase
      // For now, we'll use mock data based on the HTML template
      
      // Mock sessions data
      const mockSessions: Session[] = [
        {
          id: '1',
          title: 'AI Productivity Workshop with Sarah Johnson',
          consultant_name: 'Sarah Johnson',
          scheduled_for: '2024-11-08T14:00:00Z',
          duration: 60,
          amount: 150,
          status: 'upcoming',
          consultant_initials: 'SJ',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          escrow_status: 'escrowed',
          meeting_link: 'https://meet.google.com/abc-defg-hij'
        },
        {
          id: '2',
          title: 'DeFi Strategy Session with Michael Chen',
          consultant_name: 'Michael Chen',
          scheduled_for: '2024-11-05T10:00:00Z',
          duration: 30,
          amount: 100,
          status: 'pending',
          consultant_initials: 'MC',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          escrow_status: 'released'
        },
        {
          id: '3',
          title: 'Growth Marketing Consultation with Emma Patel',
          consultant_name: 'Emma Patel',
          scheduled_for: '2024-10-28T15:00:00Z',
          duration: 60,
          amount: 120,
          status: 'completed',
          consultant_initials: 'EP',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          escrow_status: 'released'
        }
      ];
      
      // Mock reviews data
      const mockReviews: Review[] = [
        {
          id: '1',
          reviewer_name: 'John Doe',
          reviewer_initials: 'JD',
          rating: 5,
          comment: 'Exceptional insights on AI automation workflows. Sarah provided actionable strategies that I implemented immediately. Her expertise in productivity tools saved me hours of research.',
          created_at: '2024-10-15T10:30:00Z',
          is_ai_verified: true,
          tx_hash: '0x8a3f...12bc'
        },
        {
          id: '2',
          reviewer_name: 'Alice Martinez',
          reviewer_initials: 'AM',
          rating: 5,
          comment: 'Excellent consultation! Very professional and knowledgeable about the latest DeFi trends. Would definitely recommend.',
          created_at: '2024-10-10T14:20:00Z',
          is_ai_verified: true,
          tx_hash: '0x5b2c...89de'
        }
      ];
      
      // Mock earnings data
      const mockEarnings: Earnings = {
        total: 3275,
        available: 2850,
        pending: 425,
        transactions: [
          {
            id: '1',
            type: 'consultation',
            title: 'AI Workshop with Sarah',
            date: '2024-11-01',
            amount: 150,
            status: 'completed'
          },
          {
            id: '2',
            type: 'reward',
            title: 'Referral Bonus',
            date: '2024-10-28',
            amount: 50,
            status: 'completed'
          },
          {
            id: '3',
            type: 'bonus',
            title: 'Quality Incentive',
            date: '2024-10-25',
            amount: 100,
            status: 'pending'
          }
        ]
      };
      
      // Mock NFT badges data
      const mockBadges: NFTBadge[] = [
        {
          id: '1',
          name: 'AI Expert Consultant',
          description: 'Awarded for completing 50+ AI consultations',
          earned_date: '2024-10-15',
          rarity: 'gold',
          token_id: '#001',
          is_locked: false,
          emoji: '🤖'
        },
        {
          id: '2',
          name: 'Web3 Pioneer',
          description: 'Early adopter of blockchain consulting',
          earned_date: '2024-09-20',
          rarity: 'silver',
          token_id: '#042',
          is_locked: false,
          emoji: '⛓️'
        },
        {
          id: '3',
          name: 'Top 10% Consultant',
          description: 'Ranked in top 10% of platform consultants',
          earned_date: '2024-11-01',
          rarity: 'purple',
          token_id: '#123',
          is_locked: false,
          emoji: '🎯'
        },
        {
          id: '4',
          name: 'DeFi Master',
          description: 'Complete 20 DeFi consultations (Locked)',
          earned_date: '',
          rarity: 'bronze',
          token_id: '#',
          is_locked: true,
          emoji: '💱'
        }
      ];
      
      setSessions(mockSessions);
      setReviews(mockReviews);
      setEarnings(mockEarnings);
      setBadges(mockBadges);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Function to get status styles
  const getStatusStyles = (status: Session['status']) => {
    switch (status) {
      case 'upcoming':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', text: 'Upcoming' };
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', text: 'Completed' };
      case 'pending':
        return { bg: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b', text: 'Pending' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', text: 'Cancelled' };
    }
  };

  // Function to render stars
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  // Function to get NFT card class
  const getNFTClass = (rarity: NFTBadge['rarity']) => {
    switch (rarity) {
      case 'gold': return 'gold';
      case 'silver': return 'silver';
      case 'bronze': return 'bronze';
      case 'purple': return 'purple';
      default: return 'gold';
    }
  };

  // Filter sessions based on active filter
  const filteredSessions = sessions.filter(session => {
    if (sessionFilter === 'all') return true;
    return session.status === sessionFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                🧬
              </div>
              <h1 className="text-3xl font-bold text-white">Ask Gene</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-yellow-400">💎</span>
                  <span className="font-semibold">{tokenBalance} $GENE</span>
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2">
                <span>🔗</span>
                <span>{truncateAddress(walletAddress)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 bg-gray-800/30 p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActivePage('sessions')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activePage === 'sessions' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                >
                  <span className="text-xl">📅</span>
                  <span className="font-medium">My Sessions</span>
                </button>
                
                <button
                  onClick={() => setActivePage('reputation')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activePage === 'reputation' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                >
                  <span className="text-xl">⭐</span>
                  <span className="font-medium">Reputation</span>
                </button>
                
                <button
                  onClick={() => setActivePage('earnings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activePage === 'earnings' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                >
                  <span className="text-xl">💰</span>
                  <span className="font-medium">Earnings</span>
                </button>
                
                <button
                  onClick={() => setActivePage('nft')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activePage === 'nft' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                >
                  <span className="text-xl">🎖️</span>
                  <span className="font-medium">NFT Badges</span>
                </button>
                
                <button
                  onClick={() => setActivePage('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activePage === 'settings' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                >
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium">Settings</span>
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6">
              {/* My Sessions Page */}
              {activePage === 'sessions' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Sessions</h1>
                    <p className="text-gray-400">Manage your upcoming and past consultations</p>
                  </div>
                  
                  {/* Session Filters */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      onClick={() => setSessionFilter('all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${sessionFilter === 'all' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSessionFilter('upcoming')}
                      className={`px-4 py-2 rounded-lg transition-colors ${sessionFilter === 'upcoming' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setSessionFilter('completed')}
                      className={`px-4 py-2 rounded-lg transition-colors ${sessionFilter === 'completed' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setSessionFilter('pending')}
                      className={`px-4 py-2 rounded-lg transition-colors ${sessionFilter === 'pending' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      Pending Review
                    </button>
                  </div>
                  
                  {/* Sessions List */}
                  <div className="space-y-4">
                    {filteredSessions.map((session) => {
                      const statusStyles = getStatusStyles(session.status);
                      return (
                        <div key={session.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                                style={{ background: session.gradient }}
                              >
                                {session.consultant_initials}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-2">{session.title}</h3>
                                <div className="flex flex-wrap gap-4 text-gray-300 mb-2">
                                  <span className="flex items-center gap-1">
                                    <span>📅</span>
                                    <span>{formatDate(session.scheduled_for)} • {formatTime(session.scheduled_for)} PST</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span>{session.duration} minutes</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>💰</span>
                                    <span>{formatPrice(session.amount)} ({session.escrow_status})</span>
                                  </span>
                                </div>
                                <div 
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium"
                                  style={{ background: statusStyles.bg, color: statusStyles.color }}
                                >
                                  <span>{session.status === 'upcoming' ? '🔵' : session.status === 'pending' ? '⏳' : '✅'}</span>
                                  <span>{statusStyles.text}</span>
                                  {session.status === 'upcoming' && <span>• Calendar Synced</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {session.status === 'upcoming' && (
                                <>
                                  <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => session.meeting_link && window.open(session.meeting_link, '_blank')}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                                  >
                                    Join Meeting
                                  </button>
                                </>
                              )}
                              {session.status === 'pending' && (
                                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
                                  Leave Review
                                </button>
                              )}
                              {session.status === 'completed' && (
                                <button className="px-4 py-2 border border-indigo-500 text-indigo-500 rounded-lg hover:bg-indigo-500/10 transition-colors">
                                  View Details
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reputation Page */}
              {activePage === 'reputation' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Reputation Dashboard</h1>
                    <p className="text-gray-400">Your on-chain reputation and verified feedback</p>
                  </div>
                  
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="text-3xl font-bold text-white mb-1">4.9</div>
                      <div className="text-gray-400">Average Rating</div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="text-3xl mb-2">💬</div>
                      <div className="text-3xl font-bold text-white mb-1">127</div>
                      <div className="text-gray-400">Total Reviews</div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-3xl font-bold text-white mb-1">98%</div>
                      <div className="text-gray-400">Satisfaction</div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
                      <div className="text-3xl mb-2">🔗</div>
                      <div className="text-3xl font-bold text-white mb-1">124</div>
                      <div className="text-gray-400">On-Chain Verifications</div>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-white">Rating Trend (Last 6 Months)</h3>
                      <span className="inline-flex items-center gap-2 bg-purple-900/30 text-purple-300 px-3 py-1 rounded-lg">
                        <span>⛓️</span>
                        <span className="text-sm">Data stored on Polygon</span>
                      </span>
                    </div>
                    <div className="h-48 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl flex items-center justify-center">
                      <div className="text-indigo-300 font-medium">📊 Rating trend: 4.7 → 4.8 → 4.9 → 4.9 → 4.9 → 4.9</div>
                    </div>
                  </div>
                  
                  {/* Recent Reviews */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Recent Reviews</h3>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-gray-700/50 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {review.reviewer_initials}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{review.reviewer_name}</div>
                                <div className="text-sm text-gray-400">{formatDate(review.created_at)}</div>
                              </div>
                            </div>
                            <div className="text-yellow-400 text-xl">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>
                          <div className="flex flex-wrap gap-2">
                            {review.is_ai_verified && (
                              <span className="inline-flex items-center gap-1 bg-purple-900/30 text-purple-300 px-3 py-1 rounded-lg text-sm">
                                <span>🤖</span>
                                <span>AI Verified: Positive • Authentic</span>
                              </span>
                            )}
                            {review.tx_hash && (
                              <span className="inline-flex items-center gap-1 bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-lg text-sm">
                                <span>⛓️</span>
                                <span>Hash: {truncateAddress(review.tx_hash)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings Page */}
              {activePage === 'earnings' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Earnings Dashboard</h1>
                    <p className="text-gray-400">Track your consultation earnings and rewards</p>
                  </div>
                  
                  {/* Earnings Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6">
                      <div className="text-gray-200 mb-2">Total Earnings</div>
                      <div className="text-3xl font-bold text-white mb-1">{formatPrice(earnings.total)}</div>
                      <div className="text-indigo-200">All time</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6">
                      <div className="text-gray-200 mb-2">Available to Withdraw</div>
                      <div className="text-3xl font-bold text-white mb-1">{formatPrice(earnings.available)}</div>
                      <div className="text-green-200">Ready for withdrawal</div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6">
                      <div className="text-gray-200 mb-2">Pending</div>
                      <div className="text-3xl font-bold text-white mb-1">{formatPrice(earnings.pending)}</div>
                      <div className="text-amber-200">In escrow</div>
                    </div>
                  </div>
                  
                  {/* Withdraw Button */}
                  <div className="flex justify-end mb-6">
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg">
                      💰 Withdraw Funds
                    </button>
                  </div>
                  
                  {/* Transactions Table */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                      <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-800/30">
                            <th className="py-4 px-6 text-left text-gray-400 font-medium">Transaction</th>
                            <th className="py-4 px-6 text-left text-gray-400 font-medium">Date</th>
                            <th className="py-4 px-6 text-left text-gray-400 font-medium">Amount</th>
                            <th className="py-4 px-6 text-left text-gray-400 font-medium">Status</th>
                            <th className="py-4 px-6 text-left text-gray-400 font-medium">TX Hash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.transactions.map((tx) => (
                            <tr key={tx.id} className="border-t border-gray-700/30 hover:bg-gray-800/30">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'consultation' ? 'bg-blue-900/30' : tx.type === 'reward' ? 'bg-green-900/30' : 'bg-yellow-900/30'}`}>
                                    {tx.type === 'consultation' ? '💼' : tx.type === 'reward' ? '🎁' : '⭐'}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{tx.title}</div>
                                    <div className="text-sm text-gray-400 capitalize">{tx.type}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-300">{formatDate(tx.date)}</td>
                              <td className="py-4 px-6">
                                <div className="font-semibold text-white">{formatPrice(tx.amount)}</div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${tx.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}>
                                  {tx.status === 'completed' ? '✅' : '⏳'}
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                                  {truncateAddress('0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6))}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* NFT Badges Page */}
              {activePage === 'nft' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">NFT Badges Collection</h1>
                    <p className="text-gray-400">Achievement badges earned through consultations</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden transition-transform hover:scale-[1.02] ${badge.is_locked ? 'opacity-60' : ''}`}
                      >
                        <div className={`h-48 flex items-center justify-center text-6xl ${badge.rarity === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : badge.rarity === 'silver' ? 'bg-gradient-to-r from-gray-300 to-gray-400' : badge.rarity === 'bronze' ? 'bg-gradient-to-r from-amber-800 to-amber-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                          {badge.emoji}
                          {badge.is_locked && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-6xl">🔒</div>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-white mb-2">{badge.name}</h3>
                          <p className="text-gray-400 mb-4">{badge.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              {badge.earned_date ? (
                                <div className="text-sm text-gray-500">Earned {formatDate(badge.earned_date)}</div>
                              ) : (
                                <div className="text-sm text-gray-500">Locked</div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-indigo-400">
                              {badge.token_id}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Page */}
              {activePage === 'settings' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your account and preferences</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Profile Settings */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-6">Profile Settings</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                          <div>
                            <div className="font-medium text-white">Email Notifications</div>
                            <div className="text-sm text-gray-400">Receive updates about your sessions</div>
                          </div>
                          <div className="relative inline-block w-14 h-8 cursor-pointer">
                            <input type="checkbox" className="sr-only" id="email-notifications" defaultChecked />
                            <label 
                              htmlFor="email-notifications" 
                              className="block w-full h-full bg-gray-600 rounded-full transition-colors peer-checked:bg-indigo-600"
                            >
                              <span className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                          <div>
                            <div className="font-medium text-white">Calendar Sync</div>
                            <div className="text-sm text-gray-400">Automatically add sessions to calendar</div>
                          </div>
                          <div className="relative inline-block w-14 h-8 cursor-pointer">
                            <input type="checkbox" className="sr-only" id="calendar-sync" defaultChecked />
                            <label 
                              htmlFor="calendar-sync" 
                              className="block w-full h-full bg-gray-600 rounded-full transition-colors peer-checked:bg-indigo-600"
                            >
                              <span className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-3">
                          <div>
                            <div className="font-medium text-white">AI Review Analysis</div>
                            <div className="text-sm text-gray-400">Analyze reviews with AI for insights</div>
                          </div>
                          <div className="relative inline-block w-14 h-8 cursor-pointer">
                            <input type="checkbox" className="sr-only" id="ai-analysis" defaultChecked />
                            <label 
                              htmlFor="ai-analysis" 
                              className="block w-full h-full bg-gray-600 rounded-full transition-colors peer-checked:bg-indigo-600"
                            >
                              <span className="absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wallet Connections */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-6">Wallet Connections</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-xl p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-xl">🦊</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">MetaMask</div>
                              <div className="text-sm text-gray-400">{truncateAddress(walletAddress)}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-lg text-sm font-medium">
                            Connected
                          </span>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-xl p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-xl">📱</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">WalletConnect</div>
                              <div className="text-sm text-gray-400">Not connected</div>
                            </div>
                          </div>
                          <button className="px-3 py-1 border border-gray-600 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-800">
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Actions */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-6">Account Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full py-3 px-4 border border-indigo-600 text-indigo-400 rounded-xl hover:bg-indigo-600/10 transition-colors text-left">
                          Export Consultation History
                        </button>
                        <button className="w-full py-3 px-4 border border-amber-600 text-amber-400 rounded-xl hover:bg-amber-600/10 transition-colors text-left">
                          Download Reputation Certificate
                        </button>
                        <button className="w-full py-3 px-4 border border-red-600 text-red-400 rounded-xl hover:bg-red-600/10 transition-colors text-left">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
