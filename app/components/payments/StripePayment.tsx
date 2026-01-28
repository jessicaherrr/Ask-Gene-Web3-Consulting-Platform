'use client';

import React, { useState } from 'react';
import { PaymentSessionData, PaymentMethod } from '@/types/payment';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe instance
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key');

// Stripe Elements style configuration
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

interface StripePaymentProps {
  sessionData: PaymentSessionData;
  onProcessingChange: (processing: boolean) => void;
  onSuccess: () => void;
  customerAddress?: string;
}

// Internal payment form component
const StripePaymentForm = ({
  sessionData,
  onProcessingChange,
  onSuccess,
  customerAddress,
}: StripePaymentProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [error, setError] = useState('');
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const stripe = useStripe();
  const elements = useElements();

  const handleCardChange = (field: string) => (event: any) => {
    setCardComplete((prev) => ({
      ...prev,
      [field]: event.complete,
    }));
    
    setCardErrors((prev) => ({
      ...prev,
      [field]: event.error ? event.error.message : '',
    }));
  };

  const isFormValid = () => {
    return (
      email &&
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      !cardErrors.cardNumber &&
      !cardErrors.cardExpiry &&
      !cardErrors.cardCvc
    );
  };

  const handleSubmit = async () => {
    setError('');
    onProcessingChange(true);

    // Basic validation
    if (!email) {
      setError('Email is required');
      onProcessingChange(false);
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe is not initialized');
      onProcessingChange(false);
      return;
    }

    // Check if all card fields are complete
    if (!cardComplete.cardNumber || !cardComplete.cardExpiry || !cardComplete.cardCvc) {
      setError('Please complete all card details');
      onProcessingChange(false);
      return;
    }

    try {
      // Get card elements
      const cardNumber = elements.getElement(CardNumberElement);
      const cardExpiry = elements.getElement(CardExpiryElement);
      const cardCvc = elements.getElement(CardCvcElement);

      if (!cardNumber || !cardExpiry || !cardCvc) {
        setError('Unable to access card details');
        onProcessingChange(false);
        return;
      }

      // Extract data from sessionData
      const consultantId = sessionData.consultantId;
      const consultantName = sessionData.consultantName;
      const scheduledTime = sessionData.dateTime; // matches database field name
      const durationHours = sessionData.duration;
      const hourlyRate = sessionData.hourlyRate || sessionData.amount / durationHours;
      const totalAmount = sessionData.totalAmount || sessionData.amount;
      
      // Use provided customerAddress or create a Stripe customer identifier
      const walletAddress = customerAddress || `stripe_customer_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // 1. Create consultation record in Supabase
      console.log('📝 Creating consultation record...');
      const createConsultationResponse = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultant_id: consultantId,
          client_wallet_address: walletAddress,
          scheduled_for: scheduledTime,
          duration_hours: durationHours,
          hourly_rate: hourlyRate,
          total_amount: totalAmount,
          title: sessionData.title || `Consultation with ${consultantName}`,
          description: sessionData.description || '',
          payment_method: 'stripe' as PaymentMethod,
          currency: sessionData.currency || 'USD',
        }),
      });

      const consultationResult = await createConsultationResponse.json();
      
      if (!consultationResult.success) {
        throw new Error(consultationResult.error || 'Failed to create consultation');
      }

      const consultationId = consultationResult.booking_id || consultationResult.data?.consultation?.id;
      console.log('✅ Consultation created:', consultationId);

      // 2. Create Stripe payment intent
      console.log('💳 Creating Stripe payment intent...');
      const paymentIntentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'usd',
          consultantId: consultantId,
          customerEmail: email,
          customerName: name,
          scheduledTime: scheduledTime,
          sessionDuration: durationHours,
          consultationId: consultationId,
        }),
      });

      const paymentIntentResult = await paymentIntentResponse.json();
      
      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.error || 'Failed to create payment intent');
      }

      console.log('✅ Payment intent created:', paymentIntentResult.paymentIntentId);

      // 3. Confirm payment with Stripe
      console.log('🔐 Confirming payment...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentResult.clientSecret,
        {
          payment_method: {
            card: cardNumber,
            billing_details: {
              name: name || 'Customer',
              email: email,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      console.log('✅ Payment successful:', {
        paymentIntentId: paymentIntent.id,
        consultationId: consultationId,
        status: paymentIntent.status,
      });

      // 4. Update consultation with payment success
      console.log('📤 Updating payment status...');
      const updateResponse = await fetch('/api/consultations/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: consultationId,
          paymentStatus: 'succeeded',
          stripePaymentIntentId: paymentIntent.id,
          paymentMethod: 'stripe',
        }),
      });

      const updateResult = await updateResponse.json();
      
      if (!updateResult.success) {
        console.warn('⚠️ Failed to update payment status:', updateResult.error);
        // Continue even if update fails, payment was still successful
      } else {
        console.log('✅ Payment status updated successfully');
      }

      // 5. Call success callback
      console.log('🎉 Payment process completed successfully');
      setTimeout(() => {
        onSuccess();
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed');
      onProcessingChange(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            Real Stripe integration. This will process real payments.
          </span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Card Payment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Information
          </label>
          
          {/* Card Number */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Card Number</div>
            <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <CardNumberElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={handleCardChange('cardNumber')}
                className="w-full"
              />
            </div>
            {cardErrors.cardNumber && (
              <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                {cardErrors.cardNumber}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Expiration Date */}
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expiration Date</div>
              <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <CardExpiryElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardExpiry')}
                  className="w-full"
                />
              </div>
              {cardErrors.cardExpiry && (
                <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {cardErrors.cardExpiry}
                </div>
              )}
            </div>

            {/* CVC */}
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CVC</div>
              <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <CardCvcElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardCvc')}
                  className="w-full"
                />
              </div>
              {cardErrors.cardCvc && (
                <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {cardErrors.cardCvc}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          value={bookingNotes}
          onChange={(e) => setBookingNotes(e.target.value)}
          placeholder="Any specific topics you'd like to discuss..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          rows={2}
        />
      </div>

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

      {/* Payment Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            ${sessionData.amount.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isFormValid()}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Pay ${sessionData.amount.toFixed(2)} with Credit Card
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Payments are secure and encrypted
        </div>
      </div>
    </div>
  );
};

// Main wrapper component with Stripe Elements provider
export const StripePayment = (props: StripePaymentProps) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};