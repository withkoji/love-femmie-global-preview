import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { emailMap, first } from '../server/lib';

export default createEndpoint({
  description: 'Lists the review queues: rewards, referrals, reported posts and support tickets',
  inputSchema: z.object({}),
  outputSchema: z.object({
    rewards: z.array(z.object({ id: z.string(), email: z.string(), reason: z.string(), points: z.number(), status: z.string(), createdAt: z.string() })),
    referrals: z.array(z.object({ id: z.string(), code: z.string(), referrer: z.string(), referred: z.string(), status: z.string(), createdAt: z.string() })),
    posts: z.array(z.object({ id: z.string(), author: z.string(), topic: z.string(), content: z.string(), status: z.string(), createdAt: z.string() })),
    tickets: z.array(z.object({ id: z.string(), email: z.string(), subject: z.string(), message: z.string(), status: z.string(), createdAt: z.string() })),
  }),
  execute: async () => {
    const [r, f, p, t] = await Promise.all([
      zite.rewardsLedger.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 500 }),
      zite.referrals.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 500 }),
      zite.communityPosts.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 500 }),
      zite.supportTickets.findAll({ sort: [{ field: 'createdAt', direction: 'desc' }], limit: 500 }),
    ]);
    const em = await emailMap([...r.records.map((x) => first(x.member)), ...f.records.flatMap((x) => [first(x.referrer), first(x.referredUser)]), ...t.records.map((x) => first(x.member))]);
    const e = (id: string) => em.get(id) ?? '—';
    return {
      rewards: r.records.map((x) => ({ id: x.id, email: e(first(x.member)), reason: x.reason ?? '', points: x.points ?? 0, status: x.status ?? 'Pending', createdAt: x.createdAt ?? '' })),
      referrals: f.records.map((x) => ({ id: x.id, code: x.code ?? '', referrer: e(first(x.referrer)), referred: e(first(x.referredUser)), status: x.status ?? 'Pending', createdAt: x.createdAt ?? '' })),
      posts: p.records.map((x) => ({ id: x.id, author: x.authorName ?? '', topic: x.topic ?? '', content: x.content ?? '', status: x.moderationStatus ?? 'Approved', createdAt: x.createdAt ?? '' })),
      tickets: t.records.map((x) => ({ id: x.id, email: e(first(x.member)), subject: x.subject ?? '', message: x.message ?? '', status: x.status ?? 'Open', createdAt: x.createdAt ?? '' })),
    };
  },
});
