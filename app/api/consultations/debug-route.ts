import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('🔄 POST /api/consultations - DEBUG VERSION');
  
  try {
    // 尝试解析body
    let body;
    try {
      const text = await request.text();
      console.log('📝 Raw request body:', text);
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Could not parse request body' },
        { status: 400 }
      );
    }
    
    console.log('✅ Parsed body:', body);
    
    // 简化验证
    if (!body.consultant_id || !body.user_wallet_address) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'consultant_id and user_wallet_address are required' },
        { status: 400 }
      );
    }
    
    // 初始化Supabase
    console.log('🔍 Initializing Supabase...');
    const supabase = await createClient();
    
    // 创建测试数据（不验证consultant是否存在）
    const consultationData = {
      consultant_id: body.consultant_id,
      user_wallet_address: body.user_wallet_address,
      scheduled_for: body.scheduled_for || new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: body.duration_minutes || 60,
      topics: body.topics || ['test'],
      notes: body.notes || 'Test booking',
      status: 'pending_payment',
      total_price: 100,
      currency: 'USD',
      timezone: body.timezone || 'UTC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Inserting data:', consultationData);
    
    // 尝试插入数据
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Database error', 
          message: error.message,
          code: error.code,
          details: error.details
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Success! Created consultation:', data.id);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Test booking created',
        data: data,
        booking_id: data.id 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
