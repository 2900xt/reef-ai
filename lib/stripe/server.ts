import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const CREDIT_PACKAGES = {
  SMALL: {
    credits: 10,
    price: 500, // $5.00 in cents
    priceId: 'price_small', // You'll create this in Stripe Dashboard
  },
  MEDIUM: {
    credits: 50,
    price: 2000, // $20.00 in cents
    priceId: 'price_medium',
  },
  LARGE: {
    credits: 100,
    price: 3500, // $35.00 in cents
    priceId: 'price_large',
  },
};
