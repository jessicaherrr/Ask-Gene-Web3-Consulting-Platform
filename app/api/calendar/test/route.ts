import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Calendar API is working',
    endpoints: {
      oauth: {
        get: '/api/calendar/oauth?userId=USER_ID',
        post: '/api/calendar/oauth (with { code, userId })'
      },
      status: '/api/calendar/status?userId=USER_ID',
      events: {
        get: '/api/calendar/events?userId=USER_ID&maxResults=10',
        post: '/api/calendar/events (create event)'
      },
      revoke: '/api/calendar/revoke (POST)'
    },
    env: {
      hasClientId: !!process.env.GOOGLE_CALENDAR_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      hasRedirectUri: !!process.env.GOOGLE_CALENDAR_REDIRECT_URI
    },
    timestamp: new Date().toISOString()
  });
}