// /app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Simplest initialization - only using the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'usd',
      consultantId, 
      customerEmail, 
      customerName,
      scheduledTime,
      sessionDuration = 30
    } = body;

    // Validate required fields
    if (!amount || !consultantId || !customerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, consultantId, customerEmail',
      }, { status: 400 });
    }

    console.log('🎯 Creating payment intent:', {
      amount: `$${(amount / 100).toFixed(2)}`,
      consultantId,
      customerEmail: customerEmail.substring(0, 3) + '***',
    });

    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      metadata: {
        transactionId,
        consultantId,
        customerEmail,
        scheduledTime: scheduledTime || '',
        sessionDuration: String(sessionDuration),
      },
      description: `Consultation session with ${consultantId}`,
      receipt_email: customerEmail,
      // Optional: For saving payment method for future use
      // setup_future_usage: 'off_session',
    });

    console.log('✅ Payment intent created successfully:', {
      paymentIntentId: paymentIntent.id,
      transactionId,
      status: paymentIntent.status,
      amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transactionId: transactionId,
      amount: amount,
      currency: currency,
      status: paymentIntent.status,
      livemode: paymentIntent.livemode,
    });
    
  } catch (error: any) {
    console.error('❌ Payment processing error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Payment processing failed',
      message: error.message || 'An unknown error occurred',
    }, { status: 500 });
  }
}