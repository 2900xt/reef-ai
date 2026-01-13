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
          content: `Generate a concise and descriptive title for the following research paper search abstract:\n\n${abstract}\n\nTitle:`,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Insert into reef_searches table
    const { data: searchRecord, error: insertError } = await supabase
      .from('reef_searches')
      .insert({
        user_id: userId,
        embedding: embedding,
        title: titleResponse.choices[0].message?.content?.trim() || 'Untitled',
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
