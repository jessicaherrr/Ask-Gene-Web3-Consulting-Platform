import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const expertise = searchParams.get('expertise');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'rating';
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') !== 'false';
    
    console.log('🔍 Fetching consultants with filters:', {
      expertise, limit, offset, search, sortBy, minPrice, maxPrice, verifiedOnly
    });
    
    // Build query matching YOUR schema
    let query = supabase
      .from('consultants')
      .select('*', { count: 'exact' });
    
    // Apply active and verified filters
    if (verifiedOnly) {
      query = query.eq('is_verified', true);
    }
    query = query.eq('is_active', true);
    
    // Apply expertise filter
    if (expertise) {
      query = query.contains('expertise', [expertise]);
    }
    
    // Apply search
    if (search.trim() !== '') {
      query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,bio.ilike.%${search}%`);
    }
    
    // Apply price range
    if (minPrice !== undefined) {
      query = query.gte('hourly_rate', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('hourly_rate', maxPrice);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_low_to_high':
        query = query.order('hourly_rate', { ascending: true });
        break;
      case 'price_high_to_low':
        query = query.order('hourly_rate', { ascending: false });
        break;
      case 'experience':
        query = query.order('total_hours', { ascending: false });
        break;
      case 'sessions':
        query = query.order('total_sessions', { ascending: false });
        break;
      case 'rating':
      default:
        query = query.order('rating', { ascending: false });
        break;
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: consultants, error, count } = await query;
    
    if (error) {
      console.error('❌ Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch consultants', details: error.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ Found ${consultants?.length || 0} consultants`);
    
    return NextResponse.json({
      success: true,
      data: consultants || [],
      meta: {
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
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
