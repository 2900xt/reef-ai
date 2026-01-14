import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { userId, abstract } = await request.json();

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!abstract || typeof abstract !== 'string') {
      return NextResponse.json(
        { error: 'Abstract is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate embedding for the abstract
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: abstract,
    });

    // Generate a title for the search
    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that generates concise titles for research paper searches.',
        },
        {
          role: 'user',
          content: `Keep it to 2-3 words MAX. Generate a concise and descriptive title for the following research paper search abstract:\n\n${abstract}\n\nTitle:`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // From the profiles table, subtract 1 credit from the user, but first check if they have enough credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    if (profile.credits_remaining <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 402 }
      );
    }

    // Insert into reef_searches table
    const { data: searchRecord, error: insertError } = await supabase
      .from('reef_searches')
      .insert({
        user_id: userId,
        embedding: embedding,
        title: titleResponse.choices[0].message?.content?.trim() || 'Untitled',
        abstract: abstract,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save search' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      searchId: searchRecord.id,
      message: 'Search saved successfully'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
