// components/consultants/ConsultantCard.tsx
'use client';

import { Consultant } from '@/types/supabase';
import { useRouter } from 'next/navigation';

interface ConsultantCardProps {
  consultant: Consultant;
}

export default function ConsultantCard({ consultant }: ConsultantCardProps) {
  const router = useRouter();

  const handleBookConsultation = () => {
    router.push(`/consultants/${consultant.id}/book`);
  };

  return (
    <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20">
      {/* Verified Badge */}
      {consultant.is_verified && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Verified
        </div>
      )}

      {/* Consultant Info */}
      <div className="flex items-start space-x-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {consultant.name.charAt(0)}
          </div>
          {consultant.is_active && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
          )}
        </div>

        {/* Name and Title */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
            {consultant.name}
          </h3>
          <p className="text-gray-400">{consultant.title}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(consultant.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-300 font-medium">{consultant.rating}</span>
            <span className="text-gray-500 text-sm">
              ({consultant.total_sessions || 0} sessions)
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {consultant.bio && (
        <p className="text-gray-300 mb-4 line-clamp-2">
          {consultant.bio}
        </p>
      )}

      {/* Expertise Tags */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {consultant.expertise?.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-gray-900/50 text-gray-300 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
          {consultant.expertise && consultant.expertise.length > 3 && (
            <span className="px-3 py-1 bg-gray-900/50 text-gray-400 text-sm rounded-full">
              +{consultant.expertise.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        <div>
          <div className="text-2xl font-bold text-white">
            ${consultant.hourly_rate}
            <span className="text-gray-400 text-sm font-normal">/hour</span>
          </div>
          <div className="text-sm text-gray-500">
            {consultant.min_duration_hours || 1}h min • {consultant.max_duration_hours || 8}h max
          </div>
        </div>

        <button
          onClick={handleBookConsultation}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}