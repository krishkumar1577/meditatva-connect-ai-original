const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a customer
const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        app: 'meditatva',
      },
    });
    return customer;
  } catch (error) {
    console.error('Stripe create customer error:', error);
    throw new Error('Failed to create customer');
  }
};

// Create a subscription
const createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    console.error('Stripe create subscription error:', error);
    throw new Error('Failed to create subscription');
  }
};

// Create a payment intent for one-time payments
const createPaymentIntent = async (amount, currency = 'usd', customerId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        app: 'meditatva',
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe create payment intent error:', error);
    throw new Error('Failed to create payment intent');
  }
};

// Cancel a subscription
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe cancel subscription error:', error);
    throw new Error('Failed to cancel subscription');
  }
};

// Get subscription details
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe get subscription error:', error);
    throw new Error('Failed to retrieve subscription');
  }
};

// Webhook signature verification
const constructWebhookEvent = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Stripe webhook signature verification error:', error);
    throw new Error('Webhook signature verification failed');
  }
};

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    price: 9.99,
    features: ['Access to basic meditations', 'Mood tracking', 'Basic AI recommendations'],
  },
  premium: {
    name: 'Premium Plan',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    price: 19.99,
    features: [
      'All basic features',
      'Advanced meditations',
      'AI chatbot',
      'Personalized programs',
      'Community access',
    ],
  },
  pro: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 29.99,
    features: [
      'All premium features',
      'Custom meditation scripts',
      'Advanced analytics',
      'Priority support',
      'Early access to new features',
    ],
  },
};

module.exports = {
  stripe,
  createCustomer,
  createSubscription,
  createPaymentIntent,
  cancelSubscription,
  getSubscription,
  constructWebhookEvent,
  SUBSCRIPTION_PLANS,
};
