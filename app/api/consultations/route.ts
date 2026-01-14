import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/consultations - Retrieve user consultations based on YOUR schema
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 GET /api/consultations (matching your schema)');
    
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get wallet address from query parameters
    const walletAddress = searchParams.get('wallet_address');
    
    if (!walletAddress) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Wallet address is required',
          code: 'MISSING_WALLET'
        },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log(`🔍 Fetching consultations for: ${walletAddress.substring(0, 10)}...`);
    
    // Build query matching YOUR schema fields
    let query = supabase
      .from('consultations')
      .select(`
        *,
        consultant:consultants(
          id,
          wallet_address,
          name,
          title,
          bio,
          expertise,
          hourly_rate,
          rating,
          is_verified
        )
      `, { count: 'exact' })
      .eq('client_wallet_address', walletAddress); // Note: your field is client_wallet_address
    
    // Apply status filter if provided
    if (status && status !== 'all') {
      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (validStatuses.includes(status)) {
        query = query.eq('status', status);
      }
    }
    
    // Apply sorting by scheduled date (newest first)
    query = query.order('scheduled_for', { ascending: false });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: consultations, error, count } = await query;
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch consultations',
          message: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ Found ${consultations?.length || 0} consultations`);
    
    // Calculate statistics based on YOUR status values
    const stats = {
      total: count || 0,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
    
    // Format data and calculate stats
    const now = new Date();
    const formattedConsultations = consultations?.map(consultation => {
      // Count by status
      if (consultation.status in stats) {
        stats[consultation.status]++;
      }
      
      // Calculate derived fields
      const scheduledTime = new Date(consultation.scheduled_for);
      const endTime = new Date(scheduledTime.getTime() + (consultation.duration_hours || 1) * 3600000);
      
      return {
        id: consultation.id,
        consultant_id: consultation.consultant_id,
        client_wallet_address: consultation.client_wallet_address,
        title: consultation.title,
        description: consultation.description,
        scheduled_for: consultation.scheduled_for,
        duration_hours: consultation.duration_hours,
        hourly_rate: consultation.hourly_rate,
        total_amount: consultation.total_amount,
        status: consultation.status,
        payment_status: consultation.payment_status,
        currency: consultation.currency,
        meeting_link: consultation.meeting_link,
        notes: consultation.notes,
        created_at: consultation.created_at,
        updated_at: consultation.updated_at,
        // Consultant details
        consultant: consultation.consultant || null,
        // Derived fields
        is_upcoming: scheduledTime > now,
        is_past: scheduledTime <= now,
        is_active: consultation.status === 'confirmed' || consultation.status === 'in_progress',
        end_time: endTime.toISOString(),
        duration_minutes: (consultation.duration_hours || 1) * 60,
        formatted_date: scheduledTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    }) || [];
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Consultations retrieved successfully',
      data: formattedConsultations,
      meta: {
        wallet_address: walletAddress,
        statistics: stats,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/consultations - Create new consultation matching YOUR schema
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/consultations (matching your schema)');
    
    const supabase = await createClient();
    const body = await request.json();
    
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields based on YOUR schema
    const requiredFields = ['consultant_id', 'client_wallet_address', 'scheduled_for', 'duration_hours'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'Please provide all required fields',
          missing_fields: missingFields,
          required_fields: requiredFields
        },
        { status: 400 }
      );
    }
    
    // Validate consultant exists
    console.log(`🔍 Validating consultant: ${body.consultant_id}`);
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('id, name, hourly_rate, is_verified, is_active')
      .eq('id', body.consultant_id)
      .single();
    
    if (consultantError || !consultant) {
      return NextResponse.json(
        {
          error: 'Consultant not found',
          message: 'Consultant does not exist',
          consultant_id: body.consultant_id,
          code: 'CONSULTANT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Check consultant availability
    if (!consultant.is_active || !consultant.is_verified) {
      return NextResponse.json(
        {
          error: 'Consultant unavailable',
          message: 'Consultant is not available for bookings',
          consultant_name: consultant.name,
          is_active: consultant.is_active,
          is_verified: consultant.is_verified
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ Consultant validated: ${consultant.name}, Rate: $${consultant.hourly_rate}/hr`);
    
    // Validate scheduled time
    const scheduledDate = new Date(body.scheduled_for);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        {
          error: 'Invalid date format',
          message: 'scheduled_for must be a valid ISO date string',
          received: body.scheduled_for,
          example: '2024-01-10T14:30:00Z'
        },
        { status: 400 }
      );
    }
    
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        {
          error: 'Invalid schedule time',
          message: 'Scheduled time must be in the future',
          scheduled: scheduledDate.toISOString(),
          now: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Validate duration
    const durationHours = body.duration_hours;
    if (durationHours < (consultant.min_duration_hours || 1)) {
      return NextResponse.json(
        {
          error: 'Duration too short',
          message: `Minimum duration is ${consultant.min_duration_hours || 1} hours`,
          requested: durationHours,
          minimum: consultant.min_duration_hours || 1
        },
        { status: 400 }
      );
    }
    
    if (consultant.max_duration_hours && durationHours > consultant.max_duration_hours) {
      return NextResponse.json(
        {
          error: 'Duration too long',
          message: `Maximum duration is ${consultant.max_duration_hours} hours`,
          requested: durationHours,
          maximum: consultant.max_duration_hours
        },
        { status: 400 }
      );
    }
    
    // Calculate total amount
    const hourlyRate = body.hourly_rate || consultant.hourly_rate;
    const totalAmount = hourlyRate * durationHours;
    
    // Prepare consultation data matching YOUR schema exactly
    const consultationData = {
      consultant_id: body.consultant_id,
      client_wallet_address: body.client_wallet_address, // Note: your field name
      title: body.title || `Consultation with ${consultant.name}`,
      description: body.description || '',
      scheduled_for: scheduledDate.toISOString(),
      duration_hours: durationHours,
      hourly_rate: hourlyRate,
      total_amount: totalAmount,
      status: 'pending', // Your schema: pending/confirmed/in_progress/completed/cancelled
      payment_status: 'unpaid', // Your schema: unpaid/paid/refunded/cancelled
      currency: body.currency || 'USD',
      meeting_link: body.meeting_link || '',
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Creating consultation with data:', consultationData);
    
    // Insert into database
    const { data: newConsultation, error: createError } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Database insertion error:', createError);
      return NextResponse.json(
        {
          error: 'Failed to create booking',
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
          code: createError.code
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ Booking created successfully! ID: ${newConsultation.id}`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Consultation booked successfully',
      data: {
        consultation: newConsultation,
        consultant: {
          name: consultant.name,
          hourly_rate: consultant.hourly_rate
        },
        payment: {
          required: true,
          amount: totalAmount,
          currency: consultationData.currency,
          status: 'unpaid'
        },
        schedule: {
          date: scheduledDate.toISOString(),
          duration_hours: durationHours,
          timezone: 'UTC',
          formatted_date: scheduledDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      },
      booking_id: newConsultation.id,
      next_steps: [
        'Await consultant confirmation',
        'Complete payment when requested',
        'Join meeting at scheduled time'
      ],
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
