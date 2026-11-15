import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

const course = z.object({ id: z.string(), title: z.string(), category: z.string(), description: z.string(), instructor: z.string(), difficulty: z.string(), durationMinutes: z.number(), requiredPlan: z.string(), coverImage: z.string(), rating: z.number(), trending: z.boolean(), lessonCount: z.number() });
const recipe = z.object({ id: z.string(), title: z.string(), continent: z.string(), country: z.string(), mealType: z.string(), description: z.string(), ingredients: z.string(), instructions: z.string(), prepMinutes: z.number(), cookMinutes: z.number(), servings: z.number(), allergens: z.string(), nutritionNotes: z.string(), dietTags: z.string(), image: z.string(), featuredToday: z.boolean() });
const video = z.object({ id: z.string(), title: z.string(), collection: z.string(), description: z.string(), durationMinutes: z.number(), ageRating: z.string(), requiredPlan: z.string(), thumbnail: z.string(), videoUrl: z.string(), hasCaptions: z.boolean(), featured: z.boolean() });

const article = z.object({ id: z.string(), title: z.string(), category: z.string(), author: z.string(), excerpt: z.string(), body: z.string(), image: z.string(), createdAt: z.string() });
const arrLen = (v: unknown) => (Array.isArray(v) ? v.length : v ? 1 : 0);

export default createEndpoint({
  description: 'Lists published courses, recipes and FEMMIE TV videos',
  inputSchema: z.object({}),
  outputSchema: z.object({ courses: z.array(course), recipes: z.array(recipe), videos: z.array(video), articles: z.array(article) }),
  execute: async () => {
    const [c, r, v, a, cats] = await Promise.all([
      zite.courses.findAll({ limit: 2000, filters: { status: 'Published' }, sort: [{ field: 'title', direction: 'asc' }] }),
      zite.recipes.findAll({ limit: 500 }),
      zite.videos.findAll({ limit: 500 }),
      zite.articles.findAll({ limit: 200, filters: { status: 'Published' }, sort: [{ field: 'createdAt', direction: 'desc' }] }),
      zite.categories.findAll({ limit: 100 }),
    ]);
    const catName = new Map(cats.records.map((x) => [x.id, x.name ?? '']));
    return {
      articles: a.records.map((x) => ({ id: x.id, title: x.title ?? '', category: catName.get([x.category].flat()[0] ?? '') ?? '', author: x.author ?? '', excerpt: x.excerpt ?? '', body: x.body ?? '', image: x.image ?? '', createdAt: x.createdAt ?? '' })),
      courses: c.records.map((x) => ({ id: x.id, title: x.title ?? '', category: x.category ?? '', description: x.description ?? '', instructor: x.instructor ?? '', difficulty: x.difficulty ?? '', durationMinutes: x.durationMinutes ?? 0, requiredPlan: x.requiredPlan ?? 'Discover', coverImage: x.coverImage ?? '', rating: x.rating ?? 0, trending: !!x.trending, lessonCount: arrLen(x.lessons) })),
      recipes: r.records.map((x) => ({ id: x.id, title: x.title ?? '', continent: x.continent ?? '', country: x.country ?? '', mealType: x.mealType ?? '', description: x.description ?? '', ingredients: x.ingredients ?? '', instructions: x.instructions ?? '', prepMinutes: x.prepMinutes ?? 0, cookMinutes: x.cookMinutes ?? 0, servings: x.servings ?? 0, allergens: x.allergens ?? '', nutritionNotes: x.nutritionNotes ?? '', dietTags: x.dietTags ?? '', image: x.image ?? '', featuredToday: !!x.featuredToday })),
      videos: v.records.map((x) => ({ id: x.id, title: x.title ?? '', collection: x.collection ?? '', description: x.description ?? '', durationMinutes: x.durationMinutes ?? 0, ageRating: x.ageRating ?? 'All Ages', requiredPlan: x.requiredPlan ?? 'Discover', thumbnail: x.thumbnail ?? '', videoUrl: x.videoUrl ?? '', hasCaptions: !!x.hasCaptions, featured: !!x.featured })),
    };
  },
});
