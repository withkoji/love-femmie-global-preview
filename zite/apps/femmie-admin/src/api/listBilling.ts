import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { emailMap, first } from '../server/lib';

export default createEndpoint({
  description: 'Lists payments and subscriptions for billing reporting',
  inputSchema: z.object({}),
  outputSchema: z.object({
    payments: z.array(z.object({ id: z.string(), description: z.string(), email: z.string(), amount: z.number(), currency: z.string(), status: z.string(), ref: z.string(), createdAt: z.string() })),
    subscriptions: z.array(z.object({ id: z.string(), label: z.string(), email: z.string(), status: z.string(), renewalDate: z.string().nullable(), createdAt: z.string() })),
  }),
  execute: async () => {
    const [p, s] = await Promise.all([
      zite.payments.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 1000 }),
      zite.subscriptions.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 1000 }),
    ]);
    const emails = await emailMap([...p.records, ...s.records].map((r) => first(r.member)));
    return {
      payments: p.records.map((r) => ({ id: r.id, description: r.description ?? '', email: emails.get(first(r.member)) ?? '', amount: r.amount ?? 0, currency: r.currency ?? 'USD', status: r.status ?? '', ref: r.providerReference ?? '', createdAt: r.createdAt ?? '' })),
      subscriptions: s.records.map((r) => ({ id: r.id, label: r.label ?? '', email: emails.get(first(r.member)) ?? '', status: r.status ?? '', renewalDate: r.renewalDate ?? null, createdAt: r.createdAt ?? '' })),
    };
  },
});
