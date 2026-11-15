import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile, awardBadge } from '../server/lib';

export default createEndpoint({
  description: 'Creates, likes or reports a community post',
  authenticated: true,
  inputSchema: z.object({ action: z.enum(['create', 'like', 'report']), postId: z.string().optional(), content: z.string().max(1000).optional(), topic: z.string().max(40).optional() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const p = await getOrCreateProfile(context.user);
    if (p.kidsMode) throw new Error('Posting is turned off while Kids Mode is on');
    if (input.action === 'create') {
      const content = input.content?.trim() ?? '';
      if (content.length < 3) throw new Error('Write a little more before posting');
      await zite.communityPosts.create({ record: { content, topic: input.topic || 'General', member: context.user.id, authorName: p.displayName, moderationStatus: 'Approved', likes: 0 } });
      await awardBadge(context.user.id, 'Community Voice');
      return { ok: true };
    }
    const post = input.postId ? await zite.communityPosts.findOne({ id: input.postId }) : undefined;
    if (!post) throw new Error('Post not found');
    if (input.action === 'like') await zite.communityPosts.update({ id: post.id, record: { likes: (post.likes ?? 0) + 1 } });
    else await zite.communityPosts.update({ id: post.id, record: { moderationStatus: 'Reported' } });
    return { ok: true };
  },
});
