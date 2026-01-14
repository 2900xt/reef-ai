import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await request.json();
    const { id: searchId } = await params;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    // Fetch the search record and verify ownership
    const { data: search, error: searchError } = await supabase
      .from('reef_searches')
      .select('*')
      .eq('id', searchId)
      .eq('user_id', userId)
      .single();

    if (searchError || !search) {
      console.error('Search fetch error:', searchError);
      return NextResponse.json(
        { error: 'Search record not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch similar papers using the embedding
    const { data: papers, error: papersError } = await supabase.rpc('match_papers', {
      query_embedding: search.embedding,
      match_threshold: 0.0,
      match_count: 10,
    });

    if (papersError) {
      console.error('Papers fetch error:', papersError);
      return NextResponse.json(
        { error: 'Failed to fetch similar papers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      search: {
        id: search.id,
        title: search.title,
        abstract: search.abstract || "NO ABSTRACT :(",
        created_at: search.created_at,
      },
      papers: papers || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
