import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile, firstId } from '../server/lib';

export default createEndpoint({
  description: "Gets the signed-in member's profile, progress, rewards, referrals and support tickets",
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    profile: z.object({ displayName: z.string(), plan: z.string(), country: z.string(), language: z.string(), interests: z.string(), trialEndsAt: z.string().nullable(), watchlist: z.array(z.string()), savedRecipes: z.array(z.string()), kidsMode: z.boolean(), referralCode: z.string(), role: z.string() }),
    enrollments: z.array(z.object({ courseId: z.string(), completedLessonIds: z.array(z.string()), quizCorrect: z.number(), completed: z.boolean(), grade: z.number() })),
    points: z.number(),
    pendingPoints: z.number(),
    ledger: z.array(z.object({ id: z.string(), reason: z.string(), points: z.number(), status: z.string(), createdAt: z.string() })),
    badges: z.array(z.string()),
    certificates: z.array(z.object({ id: z.string(), courseId: z.string(), issueDate: z.string() })),
    watchHistory: z.array(z.object({ videoId: z.string(), position: z.number() })),
    referrals: z.array(z.object({ id: z.string(), status: z.string(), createdAt: z.string() })),
    tickets: z.array(z.object({ id: z.string(), subject: z.string(), status: z.string(), createdAt: z.string() })),
    subscription: z.object({ status: z.string(), renewalDate: z.string().nullable() }).nullable(),
  }),
  execute: async ({ context }) => {
    const uid = context.user.id;
    const p = await getOrCreateProfile(context.user);
    const [e, l, a, c, w, r, t, s] = await Promise.all([
      zite.enrollments.findAll({ filters: { member: uid }, limit: 500 }),
      zite.rewardsLedger.findAll({ filters: { member: uid }, sort: [{ field: 'createdAt', direction: 'desc' }], limit: 200 }),
      zite.achievements.findAll({ filters: { member: uid }, limit: 100 }),
      zite.certificates.findAll({ filters: { member: uid }, limit: 500 }),
      zite.watchHistory.findAll({ filters: { member: uid }, sort: [{ field: 'updatedAt', direction: 'desc' }], limit: 50 }),
      zite.referrals.findAll({ filters: { referrer: uid }, limit: 200 }),
      zite.supportTickets.findAll({ filters: { member: uid }, sort: [{ field: 'createdAt', direction: 'desc' }], limit: 50 }),
      zite.subscriptions.findAll({ filters: { member: uid }, sort: [{ field: 'createdAt', direction: 'desc' }], limit: 1 }),
    ]);
    const split = (x?: string | null) => (x ?? '').split('\n').filter(Boolean);
    const ledger = l.records.map((x) => ({ id: x.id, reason: x.reason ?? '', points: x.points ?? 0, status: x.status ?? 'Pending', createdAt: x.createdAt ?? '' }));
    const sub = s.records[0];
    return {
      profile: { displayName: p.displayName ?? '', plan: p.plan ?? 'Discover', country: p.country ?? '', language: p.language ?? 'English', interests: p.interests ?? '', trialEndsAt: p.trialEndsAt ?? null, watchlist: split(p.watchlist), savedRecipes: split(p.savedRecipes), kidsMode: !!p.kidsMode, referralCode: p.referralCode ?? '', role: p.role ?? 'Member' },
      enrollments: e.records.map((x) => ({ courseId: firstId(x.course), completedLessonIds: split(x.completedLessonIds), quizCorrect: x.quizCorrect ?? 0, completed: !!x.completed, grade: x.grade ?? 0 })),
      points: ledger.filter((x) => x.status === 'Approved').reduce((sum, x) => sum + x.points, 0),
      pendingPoints: ledger.filter((x) => x.status === 'Pending').reduce((sum, x) => sum + x.points, 0),
      ledger,
      badges: a.records.map((x) => x.badge ?? ''),
      certificates: c.records.map((x) => ({ id: x.id, courseId: firstId(x.course), issueDate: x.issueDate ?? '' })),
      watchHistory: w.records.map((x) => ({ videoId: firstId(x.video), position: x.playbackPosition ?? 0 })),
      referrals: r.records.map((x) => ({ id: x.id, status: x.status ?? 'Pending', createdAt: x.createdAt ?? '' })),
      tickets: t.records.map((x) => ({ id: x.id, subject: x.subject ?? '', status: x.status ?? 'Open', createdAt: x.createdAt ?? '' })),
      subscription: sub ? { status: sub.status ?? 'Active', renewalDate: sub.renewalDate ?? null } : null,
    };
  },
});
