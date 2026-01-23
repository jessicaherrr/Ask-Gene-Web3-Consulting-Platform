'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePayment } from '@/app/components/providers/PaymentProvider';
import { PaymentSessionData } from '@/types/payment';

export default function BookConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const consultantId = params.id as string;
  const { showPaymentModal } = usePayment();
  
  const [consultant, setConsultant] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60); // Default 60 minutes
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch consultant details
  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        const response = await fetch(`/api/consultants/${consultantId}`);
        if (!response.ok) {
          throw new Error('Consultant not found');
        }
        const data = await response.json();
        setConsultant(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultant();
  }, [consultantId]);

  // Handle booking submission
  const handleBookNow = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time');
      return;
    }

    const dateTime = `${selectedDate}T${selectedTime}`;
    const amount = consultant?.hourly_rate ? (consultant.hourly_rate * duration) / 60 : 100; // Calculate based on hourly rate

    const sessionData: PaymentSessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      amount: amount,
      consultantId: consultantId,
      consultantName: consultant?.name || 'Consultant',
      duration: duration,
      dateTime: dateTime,
    };

    // Show payment modal
    showPaymentModal(sessionData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !consultant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Consultant not found'}</p>
          <button
            onClick={() => router.push('/consultants')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Consultants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.push('/consultants')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Consultants
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Left Column - Consultant Info */}
            <div className="md:w-1/3 p-6 border-r border-gray-200">
              <div className="mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {consultant.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-center">{consultant.name}</h1>
                <p className="text-gray-600 text-center">{consultant.title}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {consultant.expertise?.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Hourly Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${consultant.hourly_rate}/hr
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Rating</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="ml-2 text-gray-600">
                      {consultant.rating || '5.0'} ({consultant.total_sessions || 0} sessions)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-6">Schedule Consultation</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[30, 60, 90, 120].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setDuration(time)}
                        className={`py-3 px-4 rounded-lg border ${
                          duration === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {time} min
                        <div className="text-sm font-medium mt-1">
                          ${((consultant.hourly_rate * time) / 60).toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a time</option>
                    {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific topics you'd like to discuss..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultant</span>
                      <span className="font-medium">{consultant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate</span>
                      <span className="font-medium">${consultant.hourly_rate}/hr</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${((consultant.hourly_rate * duration) / 60).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookNow}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Now & Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}