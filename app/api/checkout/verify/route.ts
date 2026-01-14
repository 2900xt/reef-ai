import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Track processed sessions to prevent double-crediting
const processedSessions = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Check if already processed in memory (quick check)
    if (processedSessions.has(sessionId)) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        message: 'Credits already added'
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || '0');

    if (!userId || !credits) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Check if this session was already processed in the database
    const { data: existingPayment } = await supabaseAdmin
      .from('credit_purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingPayment) {
      processedSessions.add(sessionId);
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        message: 'Credits already added'
      });
    }

    // Get current profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Add credits
    const newCredits = (profile?.credits_remaining || 0) + credits;

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        credits_remaining: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // Record the purchase to prevent double-crediting
    await supabaseAdmin
      .from('credit_purchases')
      .insert({
        user_id: userId,
        stripe_session_id: sessionId,
        credits_added: credits,
        amount_paid: session.amount_total,
      });

    // Mark as processed in memory
    processedSessions.add(sessionId);

    return NextResponse.json({
      success: true,
      credits: newCredits,
      added: credits
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
