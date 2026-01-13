# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for your credit-based system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your application running locally or deployed

## Step 1: Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Click on **Developers** in the left sidebar
3. Click on **API keys**
4. Copy your **Publishable key** and **Secret key**
5. Update your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:**
- Use `sk_test_` and `pk_test_` keys for development
- Use `sk_live_` and `pk_live_` keys for production
- Never commit your secret keys to version control

## Step 2: Test the Checkout Flow

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/profile` in your browser
3. Click "Buy Credits"
4. Select a package and click "Select"
5. You'll be redirected to Stripe Checkout

### Test Cards

Use these test card numbers in Stripe Checkout:

- **Successful payment:** `4242 4242 4242 4242`
- **Requires authentication:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 9995`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Step 3: Set Up Webhooks for Production

Webhooks are crucial - they notify your app when a payment succeeds.

### For Local Development (using Stripe CLI)

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli#install)

2. Log in to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

5. Keep this terminal window open while testing

### For Production

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select the event: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add it to your production environment variables

## Step 4: Test the Full Flow

1. Make a test purchase using the test card `4242 4242 4242 4242`
2. Complete the checkout
3. You should be redirected back to `/profile?success=true`
4. Check your webhook logs in the Stripe CLI or Dashboard
5. Verify credits were added to your profile

## Step 5: Customize Credit Packages (Optional)

Edit the packages in `lib/stripe/server.ts`:

```typescript
export const CREDIT_PACKAGES = {
  SMALL: {
    credits: 10,
    price: 500, // $5.00 in cents
  },
  MEDIUM: {
    credits: 50,
    price: 2000, // $20.00
  },
  LARGE: {
    credits: 100,
    price: 3500, // $35.00
  },
};
```

## Step 6: Go Live

When ready to accept real payments:

1. Complete Stripe account verification
2. Switch to live API keys in your production environment
3. Update webhook endpoint to use your production URL
4. Test with real cards (start with small amounts!)

## Troubleshooting

### Credits not updating after payment

- Check webhook logs in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check your server logs for errors in `/api/webhooks/stripe`
- Ensure Supabase service role key has proper permissions

### Checkout session creation fails

- Verify `STRIPE_SECRET_KEY` is correct
- Check browser console for errors
- Verify user is authenticated

### Webhook signature verification fails

- Ensure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint
- Check that the raw request body is being used (not parsed JSON)

## Security Best Practices

1. **Never expose secret keys** - Only use `NEXT_PUBLIC_` prefix for publishable key
2. **Verify webhooks** - Always verify webhook signatures (already implemented)
3. **Use HTTPS in production** - Required for live mode
4. **Validate amounts server-side** - Never trust client-side data (already implemented)
5. **Monitor your dashboard** - Check for unusual activity regularly

## Testing Webhooks

You can manually test webhook handling:

```bash
stripe trigger checkout.session.completed
```

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Test Cards Reference](https://stripe.com/docs/testing#cards)
