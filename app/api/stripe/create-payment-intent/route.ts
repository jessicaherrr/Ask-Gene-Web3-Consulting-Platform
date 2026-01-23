import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, consultantId, sessionId, customerEmail, customerName } = body;

    // Log the request for debugging
    console.log('🎯 Demo Payment Request:', {
      amount: `$${(amount / 100).toFixed(2)}`,
      currency,
      consultantId,
      sessionId,
      customerEmail: customerEmail ? `${customerEmail.substring(0, 3)}***` : 'not provided',
    });

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock response
    const timestamp = Date.now();
    const mockId = `pi_demo_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
    
    return NextResponse.json({
      success: true,
      clientSecret: `${mockId}_secret_${Math.random().toString(36).substring(2, 12)}`,
      paymentIntentId: mockId,
      amount: amount,
      currency: currency,
      status: 'requires_payment_method',
      demo: true,
      message: 'Payment intent created in demo mode',
      nextSteps: 'In production, this would connect to Stripe for real payments'
    });
    
  } catch (error: any) {
    console.error('❌ Demo payment error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Demo payment failed',
      message: error.message || 'Unknown error',
      demo: true
    }, { status: 500 });
  }
}