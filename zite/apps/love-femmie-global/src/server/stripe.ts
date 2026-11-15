import Stripe from 'stripe';
import { integrations } from 'zitejs/integrations';
import { zite } from 'zitejs/db';

export async function getStripe() {
  const { accessToken } = await integrations.get('stripe');
  return new Stripe(accessToken, { httpClient: Stripe.createFetchHttpClient() });
}

/** Finds (or creates once) the monthly USD price for a plan, keyed by lookup_key. */
export async function getPlanPrice(stripe: Stripe, plan: string) {
  const lookupKey = `femmie_${plan.toLowerCase()}_monthly`;
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (found.data[0]) return found.data[0];
  const planRec = await zite.membershipPlans.findOne({ filters: { name: plan } });
  if (!planRec?.price) throw new Error(`No price configured for ${plan}`);
  return stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(planRec.price * 100),
    recurring: { interval: 'month' },
    lookup_key: lookupKey,
    product_data: { name: `LOVE FEMMIE GLOBAL — ${plan} Membership` },
  });
}

/** Returns the member's Stripe customer id, creating the customer the first time. */
export async function getCustomerId(stripe: Stripe, profile: { id: string; displayName?: string; stripeCustomerId?: string }, user: { id: string; email: string }) {
  if (profile.stripeCustomerId) return profile.stripeCustomerId;
  const existing = await stripe.customers.list({ email: user.email, limit: 1 });
  const customer = existing.data[0] ?? await stripe.customers.create({ email: user.email, name: profile.displayName, metadata: { ziteUserId: user.id } });
  await zite.memberProfiles.update({ id: profile.id, record: { stripeCustomerId: customer.id } });
  return customer.id;
}
