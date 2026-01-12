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
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Pass the token explicitly
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
      'create-embedding',
      {
        body: { abstract },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (edgeFunctionError) {
      // Read the actual response body
      const errorBody = await edgeFunctionError.context.json();
      console.error('Edge function error body:', errorBody);

      return NextResponse.json(
        { error: errorBody },
        { status: edgeFunctionError.context.status || 500 }
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
