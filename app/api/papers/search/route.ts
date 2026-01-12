import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { abstract, matchThreshold = 0.0, matchCount = 10 } = await request.json();

    if (!abstract || typeof abstract !== 'string') {
      return NextResponse.json(
        { error: 'Abstract is required and must be a string' },
        { status: 400 }
      );
    }

    // Create Supabase server client (handles auth automatically)
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call the edge function to create embedding and search record
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
      'create-embedding',
      {
        body: { abstract },
      }
    );

    if (edgeFunctionError) {
      console.error(edgeFunctionError);
      return NextResponse.json(
        { error: edgeFunctionError.context.statusText || 'Failed to create embedding' },
        { status: edgeFunctionError.context.status || 500}
      );
    }

    const searchId = edgeFunctionData.id;

    // Return both the search ID and the papers
    return NextResponse.json({ searchId });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
