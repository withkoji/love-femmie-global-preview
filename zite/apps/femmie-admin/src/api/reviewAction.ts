import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { logAdmin } from '../server/lib';

export default createEndpoint({
  description: 'Approves/rejects rewards and referrals, moderates posts and updates support tickets',
  inputSchema: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('reward'), id: z.string(), status: z.enum(['Approved', 'Rejected']) }),
    z.object({ kind: z.literal('referral'), id: z.string(), status: z.enum(['Qualified', 'Rejected']) }),
    z.object({ kind: z.literal('post'), id: z.string(), status: z.enum(['Approved', 'Removed']) }),
    z.object({ kind: z.literal('ticket'), id: z.string(), status: z.enum(['Open', 'In Progress', 'Resolved']) }),
  ]),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.kind === 'reward') await zite.rewardsLedger.update({ id: input.id, record: { status: input.status } });
    else if (input.kind === 'referral') await zite.referrals.update({ id: input.id, record: { status: input.status } });
    else if (input.kind === 'post') await zite.communityPosts.update({ id: input.id, record: { moderationStatus: input.status } });
    else await zite.supportTickets.update({ id: input.id, record: { status: input.status } });
    await logAdmin(context.user.id, `${input.kind}.${input.status.toLowerCase().replace(' ', '_')}`, input.id);
    return { ok: true };
  },
});
