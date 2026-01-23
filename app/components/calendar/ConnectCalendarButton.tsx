'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectCalendarButtonProps {
  userId: string;
  returnTo?: string;
  consultationId?: string;
}

export const ConnectCalendarButton = ({
  userId,
  returnTo = '/',
  consultationId,
}: ConnectCalendarButtonProps) => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Start OAuth flow
      const state = {
        userId,
        returnTo,
        consultationId,
        timestamp: Date.now(),
      };
      
      const encodedState = Buffer.from(JSON.stringify(state)).toString('base64');
      
      // Redirect to OAuth endpoint
      window.location.href = `/api/auth/google?state=${encodeURIComponent(encodedState)}`;
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect calendar');
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleConnectCalendar}
        disabled={isConnecting}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Connect Google Calendar
          </>
        )}
      </button>
      
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Connect to automatically create calendar events for your consultations
      </p>
    </div>
  );
};