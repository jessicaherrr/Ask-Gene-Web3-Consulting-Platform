import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl, handleOAuthCallback } from '@/lib/calendar-oauth';

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
    
    const authUrl = generateAuthUrl();
    
    return NextResponse.json({
      success: true,
      authUrl,
      userId,
      message: 'OAuth URL generated successfully'
    });
  } catch (error: any) {
    console.error('❌ OAuth URL generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = body;
    
    if (!code || !userId) {
      return NextResponse.json(
        { error: 'code and userId are required' },
        { status: 400 }
      );
    }
    
    const result = await handleOAuthCallback(code, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'OAuth callback failed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar connected successfully',
      hasRefreshToken: !!result.tokens?.refresh_token
    });
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to handle OAuth callback' },
      { status: 500 }
    );
  }
}