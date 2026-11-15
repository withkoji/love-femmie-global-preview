import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { getOrCreateProfile } from '../server/lib';
import { getStripe, getCustomerId } from '../server/stripe';

export default createEndpoint({
  description: 'Opens the Stripe billing portal for invoices, payment methods and cancellation',
  authenticated: true,
  inputSchema: z.object({ returnPath: z.string().default('/account') }),
  outputSchema: z.object({ url: z.string() }),
  execute: async ({ input, context }) => {
    const stripe = await getStripe();
    const profile = await getOrCreateProfile(context.user);
    const customer = await getCustomerId(stripe, profile, context.user);
    const session = await stripe.billingPortal.sessions.create({ customer, return_url: `${process.env.ZITE_APP_URL}${input.returnPath}` });
    return { url: session.url };
  },
});
