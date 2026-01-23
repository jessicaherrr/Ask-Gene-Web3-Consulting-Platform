import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = params;
    
    // Import the functions
    const { getUserTokens, isTokenExpired } = await import('@/lib/calendar-oauth');
    
    const tokens = await getUserTokens(userId);
    
    if (!tokens) {
      return NextResponse.json({
        userId,
        connected: false,
        message: 'Google Calendar not connected',
        action: 'Connect to Google Calendar'
      });
    }
    
    const expired = tokens.expiry_date 
      ? isTokenExpired(tokens.expiry_date)
      : true;
    
    return NextResponse.json({
      userId,
      connected: true,
      expired,
      hasRefreshToken: !!tokens.refresh_token,
      message: expired 
        ? 'Access token expired, refresh required'
        : 'Google Calendar is connected and active'
    });
  } catch (error: any) {
    console.error('❌ User calendar status error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get calendar status',
        userId: params.userId
      },
      { status: 500 }
    );
  }
}