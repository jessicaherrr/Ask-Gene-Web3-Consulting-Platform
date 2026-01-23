import { NextRequest, NextResponse } from 'next/server';
import { createGoogleCalendarEvent, getUserCalendarEvents } from '@/lib/calendar-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const result = await getUserCalendarEvents(userId, maxResults);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      events: result.events || [],
      count: result.events?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Get calendar events error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, consultation, consultantEmail, clientEmail } = body;
    
    if (!userId || !consultation || !consultantEmail || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, consultation, consultantEmail, clientEmail' },
        { status: 400 }
      );
    }
    
    const result = await createGoogleCalendarEvent(consultation, consultantEmail, clientEmail);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      eventLink: result.eventLink,
      message: 'Calendar event created successfully'
    });
  } catch (error: any) {
    console.error('❌ Create calendar event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}