import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { logAdmin } from '../server/lib';

export default createEndpoint({
  description: 'Marks a payment refunded or cancels a subscription (records only; no live payment provider yet)',
  inputSchema: z.object({ kind: z.enum(['refund', 'cancel']), id: z.string() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.kind === 'refund') {
      const p = await zite.payments.findOne({ id: input.id });
      if (!p) throw new Error('Payment not found');
      await zite.payments.update({ id: p.id, record: { status: 'Refunded' } });
      await logAdmin(context.user.id, 'payment.refund', `${p.providerReference} ${p.amount}`);
    } else {
      const s = await zite.subscriptions.findOne({ id: input.id });
      if (!s) throw new Error('Subscription not found');
      await zite.subscriptions.update({ id: s.id, record: { status: 'Canceled' } });
      await logAdmin(context.user.id, 'subscription.cancel', s.label ?? s.id);
    }
    await zite.integrationEvents.create({ record: { provider: 'Simulated', eventType: `admin.${input.kind}`, processingStatus: 'Processed', payload: JSON.stringify({ id: input.id }) } });
    return { ok: true };
  },
});
