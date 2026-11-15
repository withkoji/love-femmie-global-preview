import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Lists courses, articles, videos and recipes for the content manager',
  inputSchema: z.object({}),
  outputSchema: z.object({
    courses: z.array(z.object({ id: z.string(), title: z.string(), category: z.string(), instructor: z.string(), requiredPlan: z.string(), difficulty: z.string(), status: z.string(), lessons: z.number() })),
    articles: z.array(z.object({ id: z.string(), title: z.string(), categoryId: z.string(), author: z.string(), excerpt: z.string(), body: z.string(), image: z.string(), status: z.string() })),
    videos: z.array(z.object({ id: z.string(), title: z.string(), collection: z.string(), requiredPlan: z.string(), ageRating: z.string(), featured: z.boolean() })),
    categories: z.array(z.object({ id: z.string(), name: z.string() })),
  }),
  execute: async () => {
    const [c, a, v, cats] = await Promise.all([
      zite.courses.findAll({ limit: 2000, sort: [{ field: 'title', direction: 'asc' }] }),
      zite.articles.findAll({ limit: 500, sort: [{ field: 'createdAt', direction: 'desc' }] }),
      zite.videos.findAll({ limit: 500 }),
      zite.categories.findAll({ limit: 100 }),
    ]);
    return {
      courses: c.records.map((x) => ({ id: x.id, title: x.title ?? '', category: x.category ?? '', instructor: x.instructor ?? '', requiredPlan: x.requiredPlan ?? 'Discover', difficulty: x.difficulty ?? '', status: x.status ?? 'Draft', lessons: [x.lessons ?? []].flat().length })),
      articles: a.records.map((x) => ({ id: x.id, title: x.title ?? '', categoryId: [x.category ?? []].flat()[0] ?? '', author: x.author ?? '', excerpt: x.excerpt ?? '', body: x.body ?? '', image: x.image ?? '', status: x.status ?? 'Draft' })),
      videos: v.records.map((x) => ({ id: x.id, title: x.title ?? '', collection: x.collection ?? '', requiredPlan: x.requiredPlan ?? 'Discover', ageRating: x.ageRating ?? 'All Ages', featured: !!x.featured })),
      categories: cats.records.map((x) => ({ id: x.id, name: x.name ?? '' })),
    };
  },
});
