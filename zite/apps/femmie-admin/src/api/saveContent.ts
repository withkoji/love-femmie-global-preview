import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { logAdmin } from '../server/lib';

const plan = z.enum(['Discover', 'Essential', 'Plus', 'Elite']);
const status = z.enum(['Draft', 'Published']);

export default createEndpoint({
  description: 'Creates, edits, publishes or deletes courses, articles and videos',
  inputSchema: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('course'), id: z.string(), status, requiredPlan: plan }),
    z.object({ kind: z.literal('video'), id: z.string(), requiredPlan: plan, featured: z.boolean() }),
    z.object({ kind: z.literal('article'), id: z.string().optional(), title: z.string().min(3).max(150), categoryId: z.string().optional(), author: z.string().max(80), excerpt: z.string().max(300), body: z.string().max(20000), image: z.string().max(500), status }),
    z.object({ kind: z.literal('deleteArticle'), id: z.string() }),
  ]),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    if (input.kind === 'course') {
      await zite.courses.update({ id: input.id, record: { status: input.status, requiredPlan: input.requiredPlan } });
      await logAdmin(uid, 'course.update', `${input.id}: ${input.status}, ${input.requiredPlan}`);
    } else if (input.kind === 'video') {
      await zite.videos.update({ id: input.id, record: { requiredPlan: input.requiredPlan, featured: input.featured } });
      await logAdmin(uid, 'video.update', `${input.id}: ${input.requiredPlan}, featured ${input.featured}`);
    } else if (input.kind === 'article') {
      if (input.title.trim().length < 3) throw new Error('Title is required');
      const record = { title: input.title.trim(), category: input.categoryId || undefined, author: input.author, excerpt: input.excerpt, body: input.body, image: input.image, status: input.status };
      if (input.id) await zite.articles.update({ id: input.id, record });
      else await zite.articles.create({ record });
      await logAdmin(uid, input.id ? 'article.update' : 'article.create', `${input.title} (${input.status})`);
    } else {
      await zite.articles.delete({ id: input.id });
      await logAdmin(uid, 'article.delete', input.id);
    }
    return { ok: true };
  },
});
