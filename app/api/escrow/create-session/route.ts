// app/api/escrow/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseEther } from 'viem';

// ✅ Import server-safe configuration (no client-side dependencies)
import { 
  polygonAmoyConfig, 
  CONSULTING_SESSION_ADDRESS, 
  CONSULTING_SESSION_ABI,
  publicClient 
} from '@/lib/blockchain/config';
import { polygonAmoy } from 'viem/chains';

export async function POST(request: NextRequest) {
  console.log('🔵 POST /api/escrow/create-session called');
  
  try {
    // Parse request body
    const body = await request.json();
    
    const { 
      consultationId,
      consultantId, 
      scheduledTime, 
      amount, 
      customerAddress,
      customerEmail,
      sessionDuration 
    } = body;

    // Validate required fields
    if (!consultationId || !customerAddress || !amount || !consultantId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: consultationId, customerAddress, amount, consultantId',
      }, { status: 400 });
    }

    console.log('🔄 Creating escrow contract session:', {
      consultationId,
      customerAddress,
      amount,
      consultantId,
    });

    // 1. First get the consultation record
    const supabase = await createClient();
    
    const { data: consultation, error: consultError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single();

    if (consultError || !consultation) {
      return NextResponse.json({
        success: false,
        error: 'Consultation not found',
      }, { status: 404 });
    }

    // 2. Get consultant information
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('*')
      .eq('id', consultantId)
      .single();

    if (consultantError || !consultant) {
      return NextResponse.json({
        success: false,
        error: 'Consultant not found',
      }, { status: 404 });
    }

    // 3. Check smart contract balance (optional)
    const contractBalance = await publicClient.getBalance({
      address: CONSULTING_SESSION_ADDRESS as `0x${string}`,
    });

    console.log('Contract balance:', contractBalance.toString());

    // 4. Generate unique session ID for contract
    const contractSessionId = `escrow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 5. Convert amount to wei
    const amountInWei = parseEther(amount.toString()).toString();

    // 6. Update consultation record with contract information
    const { data: updatedConsultation, error: updateError } = await supabase
      .from('consultations')
      .update({
        payment_method: 'crypto',
        payment_status: 'pending',
        crypto_currency: 'MATIC',
        crypto_amount: amountInWei,
        network: 'polygon-amoy',
        contract_address: CONSULTING_SESSION_ADDRESS,
        contract_session_id: contractSessionId,
        crypto_payment_address: consultant.wallet_address, // Consultant's wallet for receiving payment
        updated_at: new Date().toISOString(),
      })
      .eq('id', consultationId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update consultation record',
      }, { status: 500 });
    }

    // 7. Create payment record in payment_records table
    const { data: paymentRecord, error: paymentRecordError } = await supabase
      .from('payment_records')
      .insert({
        consultation_id: consultationId,
        payment_method: 'crypto',
        payment_provider: 'polygon',
        provider_payment_id: contractSessionId, // Use contract session ID as provider payment ID
        amount: amount,
        crypto_amount: amountInWei,
        currency: 'USD',
        crypto_currency: 'MATIC',
        from_address: customerAddress,
        to_address: consultant.wallet_address,
        network: 'polygon-amoy',
        status: 'pending',
        metadata: {
          contract_session_id: contractSessionId,
          contract_address: CONSULTING_SESSION_ADDRESS,
          scheduled_time: scheduledTime,
          session_duration: sessionDuration,
          consultant_id: consultantId,
          customer_email: customerEmail,
        },
      })
      .select()
      .single();

    if (paymentRecordError) {
      console.error('❌ Payment record creation error:', paymentRecordError);
      // Don't fail the whole request, just log the error
      // The escrow session is still created successfully
    } else {
      console.log('✅ Payment record created:', paymentRecord.id);
    }

    // 8. Create crypto transaction record (pending state)
    const { data: cryptoTransaction, error: cryptoTransactionError } = await supabase
      .from('crypto_transactions')
      .insert({
        consultation_id: consultationId,
        transaction_hash: `pending_${contractSessionId}`, // Placeholder until real transaction hash
        from_address: customerAddress,
        to_address: CONSULTING_SESSION_ADDRESS, // Funds go to escrow contract
        contract_address: CONSULTING_SESSION_ADDRESS,
        value: amountInWei,
        token_symbol: 'MATIC',
        network: 'polygon-amoy',
        chain_id: polygonAmoy.id,
        block_number: 0, // Will be updated when transaction is mined
        status: 'pending',
        function_name: 'createSession',
        function_args: {
          consultantId,
          scheduledTime: Math.floor(new Date(scheduledTime).getTime() / 1000),
          amount: amountInWei,
        },
        explorer_url: `https://amoy.polygonscan.com/address/${CONSULTING_SESSION_ADDRESS}`,
      })
      .select()
      .single();

    if (cryptoTransactionError) {
      console.error('❌ Crypto transaction record creation error:', cryptoTransactionError);
    } else {
      console.log('✅ Crypto transaction record created:', cryptoTransaction.id);
    }

    console.log('✅ Escrow session prepared successfully:', {
      consultationId,
      contractSessionId,
      amountInWei,
    });

    return NextResponse.json({
      success: true,
      consultationId: consultationId,
      contractAddress: CONSULTING_SESSION_ADDRESS,
      contractSessionId: contractSessionId,
      amount: amount,
      cryptoAmount: amountInWei,
      currency: 'MATIC',
      network: 'polygon-amoy',
      paymentRecordId: paymentRecord?.id,
      cryptoTransactionId: cryptoTransaction?.id,
      nextSteps: 'User needs to sign transaction in wallet to create escrow session',
      contractConfig: {
        address: CONSULTING_SESSION_ADDRESS,
        abi: CONSULTING_SESSION_ABI,
        functionName: 'createSession',
        args: [
          consultantId,
          Math.floor(new Date(scheduledTime).getTime() / 1000),
          amountInWei,
        ],
        value: amountInWei,
      },
    });

  } catch (error: any) {
    console.error('❌ Escrow session creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}