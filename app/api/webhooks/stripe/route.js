// /app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Get raw body text
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Verify Webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`Webhook event received: ${event.type}`);

    // Handle event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({ 
        status: 'confirmed',
        payment_method: 'stripe',
        payment_id: paymentIntent.id,
        payment_status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Database update failed:', error);
      throw error;
    }

    console.log('Database updated successfully');

    // Create payment record
    await createPaymentRecord(paymentIntent);

  } catch (error) {
    console.error('Failed to handle payment success event:', error);
  }
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  try {
    await supabase
      .from('consultations')
      .update({ 
        status: 'payment_failed',
        payment_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);
  } catch (error) {
    console.error('Failed to update payment failure status:', error);
  }
}

// Handle completed checkout session
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  const consultationId = session.metadata?.consultation_id;
  
  if (consultationId) {
    try {
      await supabase
        .from('consultations')
        .update({ 
          status: 'confirmed',
          stripe_session_id: session.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', consultationId);
    } catch (error) {
      console.error('Failed to update checkout status:', error);
    }
  }
}

// Create payment record
async function createPaymentRecord(paymentIntent) {
  try {
    await supabase
      .from('payment_records')
      .insert({
        payment_method: 'stripe',
        provider_payment_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to create payment record:', error);
  }
}