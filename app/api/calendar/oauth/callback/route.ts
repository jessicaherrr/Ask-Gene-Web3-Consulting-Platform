import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCallback } from '@/lib/calendar-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is missing' },
        { status: 400 }
      );
    }
    
    // For demo, we'll use a default userId
    // In production, you should pass userId in the state parameter
    const userId = state || 'default-user';
    
    const result = await handleOAuthCallback(code, userId);
    
    if (!result.success) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/calendar/connect?error=oauth_failed', request.url));
    }
    
    // Redirect to success page
    return NextResponse.redirect(new URL('/calendar/connect?success=true', request.url));
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.redirect(new URL('/calendar/connect?error=internal_error', request.url));
  }
}