-- Create credit_purchases table to track payment history and prevent double-crediting
CREATE TABLE IF NOT EXISTS public.credit_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_session_id TEXT NOT NULL UNIQUE,
    credits_added INTEGER NOT NULL,
    amount_paid INTEGER, -- in cents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_purchases_stripe_session_id ON public.credit_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);

-- Enable RLS
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON public.credit_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
