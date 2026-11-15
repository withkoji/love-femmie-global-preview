import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile, canAccess, firstId, awardBadge } from '../server/lib';

export default createEndpoint({
  description: 'Grades a lesson quiz, records the attempt and progress, issues certificates and awards points',
  authenticated: true,
  inputSchema: z.object({ lessonId: z.string(), answerIndex: z.number() }),
  outputSchema: z.object({ correct: z.boolean(), pointsAwarded: z.number(), courseCompleted: z.boolean() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    const lesson = await zite.lessons.findOne({ id: input.lessonId });
    if (!lesson) throw new Error('Lesson not found');
    const courseId = firstId(lesson.course);
    const course = await zite.courses.findOne({ id: courseId });
    const profile = await getOrCreateProfile(context.user);
    if (!course || !canAccess(profile.plan ?? 'Discover', course.requiredPlan ?? 'Discover')) throw new Error('Your plan does not include this course');

    const correct = input.answerIndex === (lesson.quizAnswerIndex ?? 0);
    const quiz = await zite.quizzes.findOne({ filters: { lesson: lesson.id } });
    await zite.quizAttempts.create({ record: { label: `${profile.displayName} · ${lesson.title}`, member: uid, quiz: quiz?.id, score: correct ? 100 : 0, passed: correct } });
    if (!correct) return { correct, pointsAwarded: 0, courseCompleted: false };

    const enr = await zite.enrollments.findOne({ filters: { member: uid, course: courseId } });
    const done = new Set((enr?.completedLessonIds ?? '').split('\n').filter(Boolean));
    if (done.has(lesson.id)) return { correct, pointsAwarded: 0, courseCompleted: !!enr?.completed };
    done.add(lesson.id);

    const { records: all } = await zite.lessons.findAll({ filters: { course: courseId }, fields: ['id'], limit: 200 });
    const completed = all.every((l) => done.has(l.id));
    const quizCorrect = (enr?.quizCorrect ?? 0) + 1;
    const record = { completedLessonIds: [...done].join('\n'), quizCorrect, completed, progress: done.size / all.length, grade: Math.round((quizCorrect / done.size) * 100), completionDate: completed ? new Date().toISOString() : undefined };
    if (enr) await zite.enrollments.update({ id: enr.id, record });
    else await zite.enrollments.create({ record: { ...record, label: `${profile.displayName} · ${course.title}`, member: uid, course: courseId } });

    const rewards = [{ reason: `Lesson completed: ${lesson.title} (${course.title})`, member: uid, points: 10, status: 'Approved' as const }];
    await awardBadge(uid, 'First Lesson');
    if (completed) {
      rewards.push({ reason: `Course completed: ${course.title}`, member: uid, points: 50, status: 'Approved' as const });
      await zite.certificates.create({ record: { label: `${profile.displayName} · ${course.title}`, member: uid, course: courseId } });
      await awardBadge(uid, 'Course Graduate');
    }
    await zite.rewardsLedger.bulkCreate({ records: rewards });
    return { correct, pointsAwarded: rewards.reduce((s, r) => s + r.points, 0), courseCompleted: completed };
  },
});
