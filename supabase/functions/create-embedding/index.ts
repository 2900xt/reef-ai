import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user's JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { abstract } = await req.json()

    if (!abstract) {
      throw new Error('Abstract text is required')
    }

    // Check user's credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    if (!profile || profile.credits_remaining < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate embedding using OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate title using ChatGPT
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, descriptive titles for research paper abstracts. Generate a title that is 5-10 words long and captures the main topic of the abstract. Return only the title, nothing else.'
          },
          {
            role: 'user',
            content: `Generate a title for this abstract:\n\n${abstract}`
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    })

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text()
      throw new Error(`ChatGPT API error: ${errorText}`)
    }

    const chatData = await chatResponse.json()
    const generatedTitle = chatData.choices[0].message.content.trim()

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: abstract,
        model: 'text-embedding-3-small',
      }),
    })

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text()
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    // Start a transaction: deduct credit and insert search record
    // Deduct one credit
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq('id', user.id)

    if (updateError) {
      throw new Error('Failed to deduct credit')
    }

    // Insert the search record
    const { data: searchRecord, error: insertError } = await supabaseClient
      .from('reef_searches')
      .insert({
        user_id: user.id,
        embedding: embedding,
        title: generatedTitle,
      })
      .select('id')
      .single()

    if (insertError) {
      // Try to rollback the credit deduction
      await supabaseClient
        .from('profiles')
        .update({ credits_remaining: profile.credits_remaining })
        .eq('id', user.id)

      throw new Error('Failed to create search record')
    }

    // Return only the ID
    return new Response(
      JSON.stringify({ id: searchRecord.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
