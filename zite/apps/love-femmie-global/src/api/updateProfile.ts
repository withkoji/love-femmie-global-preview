import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile } from '../server/lib';

export default createEndpoint({
  description: "Updates the signed-in member's profile details and Kids Mode",
  authenticated: true,
  inputSchema: z.object({ displayName: z.string().min(1).max(60), country: z.string().max(60), language: z.string().max(40), interests: z.string().max(500), kidsMode: z.boolean() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const p = await getOrCreateProfile(context.user);
    await zite.memberProfiles.update({ id: p.id, record: input });
    return { ok: true };
  },
});
