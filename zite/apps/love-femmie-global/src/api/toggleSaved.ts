import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile } from '../server/lib';

export default createEndpoint({
  description: 'Adds or removes a video from the watchlist or a recipe from saved recipes',
  authenticated: true,
  inputSchema: z.object({ kind: z.enum(['watchlist', 'savedRecipes']), itemId: z.string() }),
  outputSchema: z.object({ saved: z.boolean() }),
  execute: async ({ input, context }) => {
    const p = await getOrCreateProfile(context.user);
    const set = new Set((p[input.kind] ?? '').split('\n').filter(Boolean));
    const saved = !set.has(input.itemId);
    if (saved) set.add(input.itemId); else set.delete(input.itemId);
    await zite.memberProfiles.update({ id: p.id, record: { [input.kind]: [...set].join('\n') } });
    return { saved };
  },
});
