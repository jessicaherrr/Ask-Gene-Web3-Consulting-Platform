import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      consultationId,
      transactionHash,
      contractSessionId,
      status = 'confirming'
    } = body;

    if (!consultationId || !transactionHash) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: consultationId, transactionHash',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Update consultation with transaction hash
    const { data: updatedConsultation, error: updateError } = await supabase
      .from('consultations')
      .update({
        crypto_transaction_hash: transactionHash,
        contract_session_id: contractSessionId,
        payment_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', consultationId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update consultation: ${updateError.message}`);
    }

    // Update payment record with transaction hash
    const { data: paymentRecords, error: paymentError } = await supabase
      .from('payment_records')
      .update({
        transaction_hash: transactionHash,
        provider_payment_id: transactionHash, // Update with real transaction hash
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('consultation_id', consultationId)
      .select();

    if (paymentError) {
      console.error('Payment record update error:', paymentError);
    }

    // Update crypto transaction record
    const { data: cryptoTransactions, error: cryptoError } = await supabase
      .from('crypto_transactions')
      .update({
        transaction_hash: transactionHash,
        status: 'pending', // Will be updated by blockchain listener
        updated_at: new Date().toISOString(),
      })
      .eq('consultation_id', consultationId)
      .eq('status', 'pending')
      .select();

    if (cryptoError) {
      console.error('Crypto transaction update error:', cryptoError);
    }

    return NextResponse.json({
      success: true,
      data: {
        consultation: updatedConsultation,
        paymentRecords,
        cryptoTransactions,
      },
      message: 'Transaction updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Transaction update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
      },
      { status: 500 }
    );
  }
}