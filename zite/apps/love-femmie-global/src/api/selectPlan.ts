import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile } from '../server/lib';
import { getStripe } from '../server/stripe';

export default createEndpoint({
  description: 'Moves a member to the free Discover plan and cancels any paid Stripe subscription',
  authenticated: true,
  inputSchema: z.object({ plan: z.literal('Discover') }),
  outputSchema: z.object({ plan: z.string(), trialEndsAt: z.string().nullable() }),
  execute: async ({ context }) => {
    const uid = context.user.id;
    const p = await getOrCreateProfile(context.user);
    const { records: old } = await zite.subscriptions.findAll({ filters: { member: uid, status: { in: ['Active', 'Trialing', 'Past Due'] } }, limit: 10 });
    const withStripe = old.filter((s) => s.stripeSubscriptionId);
    const stripe = withStripe.length ? await getStripe() : null;
    for (const s of old) {
      if (stripe && s.stripeSubscriptionId) await stripe.subscriptions.cancel(s.stripeSubscriptionId).catch(() => null);
      await zite.subscriptions.update({ id: s.id, record: { status: 'Canceled' } });
    }
    await zite.memberProfiles.update({ id: p.id, record: { plan: 'Discover' } });
    await zite.integrationEvents.create({ record: { provider: 'Stripe', eventType: 'subscription.canceled', processingStatus: 'Processed', payload: JSON.stringify({ member: uid }) } });
    return { plan: 'Discover', trialEndsAt: p.trialEndsAt ?? null };
  },
});
