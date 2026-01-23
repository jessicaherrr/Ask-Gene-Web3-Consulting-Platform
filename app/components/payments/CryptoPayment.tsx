'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONSULTING_SESSION_ABI, CONSULTING_SESSION_ADDRESS } from '@/lib/blockchain/config';
import { PaymentSessionData } from '@/types/payment';
import { createConsultationRecord } from '@/lib/supabase/client';

interface CryptoPaymentProps {
  sessionData: PaymentSessionData;
  onProcessingChange: (processing: boolean) => void;
  onSuccess: () => void;
}

export const CryptoPayment = ({
  sessionData,
  onProcessingChange,
  onSuccess,
}: CryptoPaymentProps) => {
  const { address } = useAccount();
  const [bookingNotes, setBookingNotes] = useState('');
  const [error, setError] = useState<string>('');
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Contract write hook for creating session
  const {
    data: hash,
    writeContract: createSession,
    isPending: isCreating,
    error: createError,
  } = useWriteContract();

  // Transaction confirmation hook
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update processing state
  useEffect(() => {
    const processing = isCreating || isConfirming;
    onProcessingChange(processing);
  }, [isCreating, isConfirming, onProcessingChange]);

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash && address) {
      console.log('✅ Smart contract transaction confirmed:', hash);
      saveConsultationToDatabase(hash);
    }
  }, [isSuccess, hash, address]);

  // Handle errors
  useEffect(() => {
    if (createError) {
      console.error('❌ Contract error:', createError);
      setError(createError.message);
      onProcessingChange(false);
    }
  }, [createError, onProcessingChange]);

  // Save consultation to Supabase with transaction hash
  const saveConsultationToDatabase = async (txHash: string) => {
    try {
      console.log('💾 Saving to Supabase...');
      
      const consultationData = {
        id: sessionData.sessionId,
        client_id: address!,
        consultant_id: sessionData.consultantId,
        scheduled_time: sessionData.dateTime,
        amount: sessionData.amount,
        status: 'scheduled',
        transaction_hash: txHash,
        contract_address: CONSULTING_SESSION_ADDRESS,
        contract_session_id: sessionId, // Store the contract session ID
        notes: bookingNotes,
        duration_minutes: sessionData.duration,
        payment_method: 'crypto',
      };

      console.log('📦 Consultation data:', consultationData);

      const result = await createConsultationRecord(consultationData);
      
      console.log('✅ Saved to Supabase:', result);

      // Wait a moment then trigger success
      setTimeout(() => {
        console.log('🎉 Payment flow completed successfully');
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('❌ Error saving to database:', err);
      setError('Failed to save booking. Transaction succeeded but record not saved.');
      // Even if DB save fails, contract transaction is already complete
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }
  };

  // Handle payment submission - CREATE ESCROW CONTRACT SESSION
  const handlePayment = async () => {
    setError('');
    
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    // Validate inputs
    if (!sessionData.dateTime) {
      setError('Invalid date/time selected');
      return;
    }

    try {
      console.log('🚀 Starting escrow contract creation...');
      
      // Convert amount to wei (MATIC)
      const amountInWei = parseEther(sessionData.amount.toString());
      console.log(`💰 Amount: ${sessionData.amount} MATIC = ${amountInWei.toString()} wei`);

      // Calculate scheduled time as Unix timestamp (seconds)
      const scheduledTime = Math.floor(new Date(sessionData.dateTime).getTime() / 1000);
      console.log(`📅 Scheduled time: ${new Date(sessionData.dateTime).toISOString()} = ${scheduledTime} (Unix)`);

      // Validate future time
      const currentTime = Math.floor(Date.now() / 1000);
      if (scheduledTime <= currentTime) {
        setError('Please select a future date and time');
        return;
      }

      console.log('📝 Calling smart contract createSession()...');
      console.log('Contract Address:', CONSULTING_SESSION_ADDRESS);
      console.log('Parameters:', {
        consultantId: sessionData.consultantId,
        scheduledTime,
        amount: amountInWei.toString(),
      });

      // Call smart contract to create escrow session
      createSession({
        address: CONSULTING_SESSION_ADDRESS,
        abi: CONSULTING_SESSION_ABI,
        functionName: 'createSession',
        args: [
          sessionData.consultantId, 
          BigInt(scheduledTime),
          amountInWei
        ],
        value: amountInWei,
      });

      console.log('⏳ Waiting for wallet confirmation...');

    } catch (err: any) {
      console.error('❌ Payment initiation error:', err);
      setError(`Failed to initiate payment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Escrow Explanation */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Smart Contract Escrow
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Funds are held securely in the escrow contract until the consultation is completed. 
              The consultant receives 95%, platform fee is 5%.
            </p>
          </div>
        </div>
      </div>

      {/* Booking Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={bookingNotes}
          onChange={(e) => setBookingNotes(e.target.value)}
          placeholder="Any specific topics you'd like to discuss..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          rows={3}
          disabled={isCreating || isConfirming}
        />
      </div>

      {/* Transaction Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Amount in MATIC</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {sessionData.amount} MATIC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Contract Address</span>
            <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate ml-2">
              {CONSULTING_SESSION_ADDRESS.slice(0, 6)}...{CONSULTING_SESSION_ADDRESS.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Network</span>
            <span className="text-gray-700 dark:text-gray-300">Polygon Amoy Testnet</span>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {isCreating && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Waiting for wallet confirmation...
            </span>
          </div>
        </div>
      )}

      {isConfirming && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Confirming blockchain transaction...
            </span>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300">
              Escrow contract created successfully!
            </span>
          </div>
          {hash && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              TX: {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isCreating || isConfirming || isSuccess || !address}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Confirm in Wallet
          </>
        ) : isConfirming ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Escrow...
          </>
        ) : isSuccess ? (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Escrow Created
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Create Escrow & Pay
          </>
        )}
      </button>

      {/* Status Summary */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-medium">Payment Flow:</p>
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${isCreating || isConfirming || isSuccess ? 'text-blue-500' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${isCreating || isConfirming || isSuccess ? 'bg-blue-500' : 'bg-gray-300'} mr-1`}></div>
            <span>Wallet</span>
          </div>
          <div className="text-gray-300">→</div>
          <div className={`flex items-center ${isConfirming || isSuccess ? 'text-blue-500' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${isConfirming || isSuccess ? 'bg-blue-500' : 'bg-gray-300'} mr-1`}></div>
            <span>Blockchain</span>
          </div>
          <div className="text-gray-300">→</div>
          <div className={`flex items-center ${isSuccess ? 'text-green-500' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-gray-300'} mr-1`}></div>
            <span>Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};