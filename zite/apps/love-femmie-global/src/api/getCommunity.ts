import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Lists approved community posts',
  inputSchema: z.object({}),
  outputSchema: z.object({ posts: z.array(z.object({ id: z.string(), authorName: z.string(), topic: z.string(), content: z.string(), likes: z.number(), createdAt: z.string() })) }),
  execute: async () => {
    const { records } = await zite.communityPosts.findAll({ filters: { moderationStatus: 'Approved' }, sort: [{ field: 'createdAt', direction: 'desc' }], limit: 100 });
    return { posts: records.map((p) => ({ id: p.id, authorName: p.authorName ?? 'Member', topic: p.topic ?? 'General', content: p.content ?? '', likes: p.likes ?? 0, createdAt: p.createdAt ?? '' })) };
  },
});
