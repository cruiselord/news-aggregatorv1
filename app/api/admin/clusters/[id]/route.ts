import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE /api/admin/clusters/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Unlink articles from this cluster
    const { error: unlinkError } = await supabase
      .from('articles')
      .update({ cluster_id: null })
      .eq('cluster_id', id);

    if (unlinkError) throw unlinkError;

    // Delete the cluster
    const { error: deleteError } = await supabase
      .from('story_clusters')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete cluster error:', error);
    return NextResponse.json(
      { error: 'Failed to delete cluster' },
      { status: 500 }
    );
  }
}
