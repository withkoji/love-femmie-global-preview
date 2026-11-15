import { z } from 'zod';
import Stripe from 'stripe';
import { createEndpoint } from 'zitejs/backend';
import { getOrCreateProfile } from '../server/lib';
import { getStripe, getPlanPrice, getCustomerId } from '../server/stripe';

export default createEndpoint({
  description: 'Starts a Stripe subscription for a paid plan and returns the secret for the payment form',
  authenticated: true,
  inputSchema: z.object({ plan: z.enum(['Essential', 'Plus', 'Elite']) }),
  outputSchema: z.object({ subscriptionId: z.string(), clientSecret: z.string(), mode: z.enum(['payment', 'setup']), trial: z.boolean() }),
  execute: async ({ input, context }) => {
    const stripe = await getStripe();
    const profile = await getOrCreateProfile(context.user);
    const customer = await getCustomerId(stripe, profile, context.user);
    const price = await getPlanPrice(stripe, input.plan);
    const trial = !profile.trialEndsAt;

    const sub = await stripe.subscriptions.create({
      customer,
      items: [{ price: price.id }],
      trial_period_days: trial ? 14 : undefined,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      metadata: { plan: input.plan, ziteUserId: context.user.id },
      expand: ['latest_invoice.confirmation_secret', 'pending_setup_intent'],
    });

    const setup = sub.pending_setup_intent as Stripe.SetupIntent | null;
    if (setup?.client_secret) return { subscriptionId: sub.id, clientSecret: setup.client_secret, mode: 'setup' as const, trial };
    const secret = (sub.latest_invoice as Stripe.Invoice | null)?.confirmation_secret?.client_secret;
    if (!secret) throw new Error('Could not start checkout');
    return { subscriptionId: sub.id, clientSecret: secret, mode: 'payment' as const, trial };
  },
});
