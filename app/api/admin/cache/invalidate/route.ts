import { NextRequest, NextResponse } from 'next/server';
import { invalidateOnDataChange, resetCacheStats } from '@/lib/cache';

// POST /api/admin/cache/invalidate
export async function POST(request: NextRequest) {
  try {
    invalidateOnDataChange();
    resetCacheStats();

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}
