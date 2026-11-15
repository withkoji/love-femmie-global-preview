import { z } from 'zod';
import Stripe from 'stripe';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile } from '../server/lib';
import { getStripe } from '../server/stripe';

export default createEndpoint({
  description: 'Verifies a Stripe subscription after payment and activates the member plan',
  authenticated: true,
  inputSchema: z.object({ subscriptionId: z.string() }),
  outputSchema: z.object({ plan: z.string(), status: z.string() }),
  execute: async ({ input, context }) => {
    const stripe = await getStripe();
    const profile = await getOrCreateProfile(context.user);
    const sub = await stripe.subscriptions.retrieve(input.subscriptionId, { expand: ['latest_invoice'] });
    if (sub.customer !== profile.stripeCustomerId) throw new Error('Subscription not found');
    if (!['active', 'trialing'].includes(sub.status)) throw new Error('Payment has not completed yet');

    const plan = sub.metadata.plan;
    const uid = context.user.id;
    const planRec = await zite.membershipPlans.findOne({ filters: { name: plan } });
    const periodEnd = new Date(sub.items.data[0].current_period_end * 1000).toISOString();
    const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : profile.trialEndsAt ?? null;

    // Cancel any other Stripe subscription this member still has (plan switch).
    const { records: old } = await zite.subscriptions.findAll({ filters: { member: uid, status: { in: ['Active', 'Trialing'] } }, limit: 10 });
    for (const s of old) {
      if (s.stripeSubscriptionId === sub.id) continue;
      if (s.stripeSubscriptionId) await stripe.subscriptions.cancel(s.stripeSubscriptionId).catch(() => null);
      await zite.subscriptions.update({ id: s.id, record: { status: 'Canceled' } });
    }

    await zite.memberProfiles.update({ id: profile.id, record: { plan, trialEndsAt } });
    const status = sub.status === 'trialing' ? 'Trialing' : 'Active';
    await zite.subscriptions.bulkCreate({
      records: [{ label: `${profile.displayName} · ${plan}`, member: uid, plan: planRec?.id ?? null, status, renewalDate: periodEnd, stripeSubscriptionId: sub.id }],
      matchOn: ['stripeSubscriptionId'],
    });
    const inv = sub.latest_invoice as Stripe.Invoice | null;
    if (inv) {
      await zite.payments.bulkCreate({
        records: [{ description: `${plan} ${status === 'Trialing' ? 'trial start' : 'monthly'}`, member: uid, amount: inv.amount_paid / 100, currency: inv.currency.toUpperCase(), providerReference: inv.id, status: 'Succeeded' }],
        matchOn: ['providerReference'],
      });
    }
    await zite.integrationEvents.create({ record: { provider: 'Stripe', eventType: 'checkout.subscription_confirmed', processingStatus: 'Processed', payload: JSON.stringify({ plan, subscription: sub.id }) } });
    return { plan, status };
  },
});
