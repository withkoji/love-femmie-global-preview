import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { emailMap, first } from '../server/lib';

export default createEndpoint({
  description: 'Lists the admin audit log and integration events',
  inputSchema: z.object({}),
  outputSchema: z.object({
    activity: z.array(z.object({ id: z.string(), admin: z.string(), action: z.string(), details: z.string(), timestamp: z.string() })),
    events: z.array(z.object({ id: z.string(), provider: z.string(), eventType: z.string(), status: z.string(), createdAt: z.string() })),
  }),
  execute: async () => {
    const [a, e] = await Promise.all([
      zite.adminActivity.findAll({ sort: [{ field: 'timestamp', direction: 'desc' }], limit: 300 }),
      zite.integrationEvents.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 300 }),
    ]);
    const em = await emailMap(a.records.map((x) => first(x.admin)));
    return {
      activity: a.records.map((x) => ({ id: x.id, admin: em.get(first(x.admin)) ?? '—', action: x.action ?? '', details: x.details ?? '', timestamp: x.timestamp ?? '' })),
      events: e.records.map((x) => ({ id: x.id, provider: x.provider ?? '', eventType: x.eventType ?? '', status: x.processingStatus ?? '', createdAt: x.createdAt ?? '' })),
    };
  },
});
