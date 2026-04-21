import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/sources
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Fetch sources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sources (create new source)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, bias_label } = body;

    if (!name || !url || !bias_label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sources')
      .insert([
        {
          name,
          url,
          bias_label,
          factuality_score: 7.0,
          active: true,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Create source error:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
