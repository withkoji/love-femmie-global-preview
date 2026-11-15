import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { logAdmin } from '../server/lib';

export default createEndpoint({
  description: "Updates a member's plan, role or Kids Mode and logs the change",
  inputSchema: z.object({ id: z.string(), plan: z.enum(['Discover', 'Essential', 'Plus', 'Elite']), role: z.enum(['Member', 'Parent', 'Creator', 'Admin']), kidsMode: z.boolean() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const p = await zite.memberProfiles.findOne({ id: input.id });
    if (!p) throw new Error('Member not found');
    await zite.memberProfiles.update({ id: input.id, record: { plan: input.plan, role: input.role, kidsMode: input.kidsMode } });
    await logAdmin(context.user.id, 'member.update', `${p.displayName}: plan ${p.plan}→${input.plan}, role ${p.role ?? 'Member'}→${input.role}, kids ${input.kidsMode}`);
    return { ok: true };
  },
});
