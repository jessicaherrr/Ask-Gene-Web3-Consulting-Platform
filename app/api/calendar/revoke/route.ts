import { NextRequest, NextResponse } from 'next/server';
import { revokeAccess } from '@/lib/calendar-oauth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const result = await revokeAccess(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar access revoked successfully'
    });
  } catch (error: any) {
    console.error('❌ Revoke access error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revoke access' },
      { status: 500 }
    );
  }
}