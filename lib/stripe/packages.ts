export const CREDIT_PACKAGES = {
  SMALL: {
    credits: 100,
    price: 100, // $1.00 in cents
    priceId: 'price_small', // You'll create this in Stripe Dashboard
  },
  MEDIUM: {
    credits: 500,
    price: 300, // $3.00 in cents
    priceId: 'price_medium',
  },
  LARGE: {
    credits: 2000,
    price: 1000, // $10.00 in cents
    priceId: 'price_large',
  },
};
