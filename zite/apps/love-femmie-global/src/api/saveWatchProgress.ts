import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Saves video playback position for continue watching',
  authenticated: true,
  inputSchema: z.object({ videoId: z.string(), position: z.number().min(0) }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    const ex = await zite.watchHistory.findOne({ filters: { member: uid, video: input.videoId } });
    if (ex) await zite.watchHistory.update({ id: ex.id, record: { playbackPosition: Math.floor(input.position) } });
    else await zite.watchHistory.create({ record: { label: context.user.email, member: uid, video: input.videoId, playbackPosition: Math.floor(input.position) } });
    return { ok: true };
  },
});
