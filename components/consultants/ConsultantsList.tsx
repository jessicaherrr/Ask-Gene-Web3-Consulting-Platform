// components/consultants/ConsultantsList.tsx
'use client';

import { useState } from 'react';
import ConsultantCard from './ConsultantCard';
import { Consultant } from '@/types/supabase';

interface ConsultantsListProps {
  consultants: Consultant[];
}

export default function ConsultantsList({ consultants }: ConsultantsListProps) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // 排序函数
  const sortConsultants = (consultants: Consultant[]) => {
    switch (sortBy) {
      case 'price-low':
        return [...consultants].sort((a, b) => a.hourly_rate - b.hourly_rate);
      case 'price-high':
        return [...consultants].sort((a, b) => b.hourly_rate - a.hourly_rate);
      case 'rating':
      default:
        return [...consultants].sort((a, b) => b.rating - a.rating);
    }
  };

  // 过滤函数
  const filterConsultants = (consultants: Consultant[]) => {
    if (filter === 'all') return consultants;
    return consultants.filter(consultant => 
      consultant.expertise?.includes(filter) || 
      consultant.expertise?.some(exp => exp.toLowerCase().includes(filter.toLowerCase()))
    );
  };

  const filteredAndSortedConsultants = sortConsultants(filterConsultants(consultants));

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-800/30 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="rating">Highest Rating</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        
        <div className="text-gray-400">
          {filteredAndSortedConsultants.length} of {consultants.length} consultants
        </div>
      </div>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedConsultants.map((consultant) => (
          <ConsultantCard key={consultant.id} consultant={consultant} />
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedConsultants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No consultants match your filters</div>
          <button 
            onClick={() => setFilter('all')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}