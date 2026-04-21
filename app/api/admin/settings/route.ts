import { NextRequest, NextResponse } from 'next/server';

// In-memory settings store
let settings = {
  clusteringEnabled: true,
  cachingEnabled: true,
  automaticClustering: false,
  automaticClusteringInterval: 3600, // 1 hour
  geminiRefinement: false,
  lastUpdate: new Date().toISOString(),
};

// GET /api/admin/settings
export async function GET() {
  return NextResponse.json(settings);
}

// POST /api/admin/settings (update settings)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    settings = {
      ...settings,
      ...body,
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
