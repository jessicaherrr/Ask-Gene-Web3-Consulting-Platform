import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    console.log('📝 Received feedback submission:', body);
    
    // Validate required fields
    const requiredFields = ['consultation_id', 'rating', 'comment', 'wallet_address'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: missingFields
        },
        { status: 400 }
      );
    }
    
    // Validate rating
    const rating = Number(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: 'Invalid rating',
          message: 'Rating must be a number between 1 and 5'
        },
        { status: 400 }
      );
    }
    
    // Check if consultation exists
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('id, consultant_id, status')
      .eq('id', body.consultation_id)
      .single();
    
    if (consultationError || !consultation) {
      return NextResponse.json(
        {
          error: 'Consultation not found',
          message: 'The consultation does not exist'
        },
        { status: 404 }
      );
    }
    
    // Check if consultation is completed
    if (consultation.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Invalid consultation status',
          message: 'You can only submit feedback for completed consultations'
        },
        { status: 400 }
      );
    }
    
    // Prepare feedback data
    const feedbackData = {
      consultation_id: body.consultation_id,
      consultant_id: consultation.consultant_id,
      rating: rating,
      comment: body.comment,
      is_public: body.is_public !== false,
      categories: body.categories || [],
      submitted_by: body.wallet_address,
      ai_processed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Creating feedback:', feedbackData);
    
    // Insert feedback into database
    const { data: newFeedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();
    
    if (feedbackError) {
      console.error('❌ Error creating feedback:', feedbackError);
      return NextResponse.json(
        {
          error: 'Failed to submit feedback',
          message: 'Could not save feedback to database'
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Feedback submitted successfully');
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedback: newFeedback
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/feedback:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add GET method for feedback
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const consultantId = searchParams.get('consultant_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!consultantId) {
      return NextResponse.json(
        {
          error: 'Missing parameter',
          message: 'consultant_id is required'
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Fetching feedback for consultant:', consultantId);
    
    let query = supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .eq('consultant_id', consultantId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: feedback, error, count } = await query;
    
    if (error) {
      console.error('❌ Error fetching feedback:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch feedback',
          details: error.message
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ Found ${feedback?.length || 0} feedback items`);
    
    // Calculate statistics
    let ratingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    
    if (feedback) {
      feedback.forEach(item => {
        ratingStats[item.rating as keyof typeof ratingStats]++;
        totalRating += item.rating;
      });
    }
    
    const averageRating = feedback && feedback.length > 0 
      ? parseFloat((totalRating / feedback.length).toFixed(1))
      : 0;
    
    return NextResponse.json({
      success: true,
      data: feedback || [],
      meta: {
        consultant_id: consultantId,
        statistics: {
          total: count || 0,
          average_rating: averageRating,
          rating_distribution: ratingStats
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/feedback:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
