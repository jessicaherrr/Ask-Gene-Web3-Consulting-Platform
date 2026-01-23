import { NextRequest, NextResponse } from 'next/server';
import { getUserTokens, isTokenExpired } from '@/lib/calendar-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const tokens = await getUserTokens(userId);
    
    if (!tokens) {
      return NextResponse.json({
        connected: false,
        message: 'Google Calendar not connected',
        action: 'Connect to Google Calendar'
      });
    }
    
    const expired = tokens.expiry_date 
      ? isTokenExpired(tokens.expiry_date)
      : true;
    
    return NextResponse.json({
      connected: true,
      expired,
      hasRefreshToken: !!tokens.refresh_token,
      message: expired 
        ? 'Access token expired, refresh required'
        : 'Google Calendar is connected and active'
    });
  } catch (error: any) {
    console.error('❌ Calendar status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check calendar status' },
      { status: 500 }
    );
  }
}