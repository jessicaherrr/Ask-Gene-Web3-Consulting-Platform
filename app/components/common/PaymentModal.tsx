'use client';

import React, { useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'viem/chains';
import { PaymentMethod, PaymentSessionData } from '@/types/payment';
import { CryptoPayment } from '@/app/components/payments/CryptoPayment';
import { StripePayment } from '@/app/components/payments/StripePayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: PaymentSessionData;
}

export const PaymentModal = ({ isOpen, onClose, sessionData }: PaymentModalProps) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't render if not open
  if (!isOpen) return null;

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    if (!isProcessing) {
      setPaymentMethod(method);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  // Check if user is on correct network
  const isCorrectNetwork = chainId === polygonAmoy.id;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Complete Booking
            </h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Consultant</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sessionData.consultantName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date & Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(sessionData.dateTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sessionData.duration} min
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ${sessionData.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePaymentMethodChange('crypto')}
                disabled={isProcessing}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 mb-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
                      <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" />
                    </svg>
                  </div>
                  <span className="font-medium">Crypto</span>
                  <span className="text-xs text-gray-500 mt-1">Pay with MATIC</span>
                </div>
              </button>
              <button
                onClick={() => handlePaymentMethodChange('stripe')}
                disabled={isProcessing}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 mb-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-purple-500">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="font-medium">Credit Card</span>
                  <span className="text-xs text-gray-500 mt-1">Pay with Stripe</span>
                </div>
              </button>
            </div>
          </div>

          {/* Network & Wallet Warnings */}
          {paymentMethod === 'crypto' && (
            <div className="space-y-3 mb-6">
              {!isConnected && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      Wallet not connected. Please connect to continue.
                    </span>
                  </div>
                </div>
              )}

              {isConnected && !isCorrectNetwork && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-yellow-700 dark:text-yellow-300">
                        Wrong network detected
                      </span>
                    </div>
                    <button
                      onClick={() => switchChain({ chainId: polygonAmoy.id })}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Switch to Polygon Amoy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Component */}
          <div className="mt-6">
            {paymentMethod === 'crypto' && isConnected && isCorrectNetwork && (
              <CryptoPayment
                sessionData={sessionData}
                onProcessingChange={setIsProcessing}
                onSuccess={onClose}
              />
            )}

            {paymentMethod === 'stripe' && (
              <StripePayment
                sessionData={sessionData}
                onProcessingChange={setIsProcessing}
                onSuccess={onClose}
              />
            )}
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101]">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Processing Payment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                    {paymentMethod === 'crypto' 
                      ? 'Please confirm the transaction in your wallet...' 
                      : 'Processing your payment...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Save consultation record to database and create Google Calendar event
 * This function should be called after successful payment
 * 
 * @param txHash - Transaction hash from blockchain
 */
const saveConsultationToDatabase = async (txHash: string) => {
  try {
    // Save consultation record to Supabase database
    const consultation = await createConsultationRecord({
      // ... your consultation data here
    });

    // Create Google Calendar event for the consultation session
    try {
      const calendarResult = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultation: consultation,
          consultantEmail: 'consultant@example.com', // Get from database
          clientEmail: 'client@example.com', // Get from user information
        }),
      });

      const calendarData = await calendarResult.json();
      
      if (calendarData.success) {
        console.log('✅ Calendar event created successfully:', calendarData.eventLink);
        // You can display the calendar link to the user here
      }
    } catch (calendarError) {
      console.error('⚠️ Calendar event creation failed (non-critical error):', calendarError);
      // Calendar creation failure does not affect the main payment flow
      // The consultation is still saved successfully
    }

    // ... rest of your success handling logic here
    
  } catch (error) {
    // ... error handling logic here
  }
};

function createConsultationRecord(arg0: {}) {
  throw new Error('Function not implemented.');
}
