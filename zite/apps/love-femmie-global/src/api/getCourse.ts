import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Gets a course with its ordered lessons (quiz answers stay hidden)',
  inputSchema: z.object({ courseId: z.string() }),
  outputSchema: z.object({
    course: z.object({ id: z.string(), title: z.string(), category: z.string(), description: z.string(), objectives: z.string(), instructor: z.string(), difficulty: z.string(), durationMinutes: z.number(), requiredPlan: z.string(), coverImage: z.string(), rating: z.number() }),
    lessons: z.array(z.object({ id: z.string(), title: z.string(), order: z.number(), content: z.string(), videoUrl: z.string(), quizQuestion: z.string(), quizOptions: z.array(z.string()) })),
  }),
  execute: async ({ input }) => {
    const c = await zite.courses.findOne({ id: input.courseId });
    if (!c) throw new Error('Course not found');
    const { records } = await zite.lessons.findAll({ filters: { course: c.id }, sort: [{ field: 'order', direction: 'asc' }], limit: 200 });
    return {
      course: { id: c.id, title: c.title ?? '', category: c.category ?? '', description: c.description ?? '', objectives: c.objectives ?? '', instructor: c.instructor ?? '', difficulty: c.difficulty ?? '', durationMinutes: c.durationMinutes ?? 0, requiredPlan: c.requiredPlan ?? 'Discover', coverImage: c.coverImage ?? '', rating: c.rating ?? 0 },
      lessons: records.map((l) => ({ id: l.id, title: l.title ?? '', order: l.order ?? 0, content: l.content ?? '', videoUrl: l.videoUrl ?? '', quizQuestion: l.quizQuestion ?? '', quizOptions: (l.quizOptions ?? '').split('\n').filter(Boolean) })),
    };
  },
});
