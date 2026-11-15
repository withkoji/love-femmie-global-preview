import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

const num = (v: unknown) => Number(v ?? 0);

export default createEndpoint({
  description: 'Returns dashboard metrics: members, revenue, content, engagement and queues',
  inputSchema: z.object({}),
  outputSchema: z.object({
    members: z.number(), mrr: z.number(), collected: z.number(), courses: z.number(), lessons: z.number(), videoViews: z.number(),
    openTickets: z.number(), pendingRewards: z.number(), reportedPosts: z.number(), enrollments: z.number(), completions: z.number(),
    planMix: z.array(z.object({ plan: z.string(), count: z.number() })),
    categoryMix: z.array(z.object({ category: z.string(), count: z.number() })),
  }),
  execute: async () => {
    const q = async (query: string) => (await zite.sql({ query })).rows;
    const [m, plans, mrr, paid, c, l, wh, t, rw, rp, en, cats] = await Promise.all([
      q(`SELECT COUNT(*) AS n FROM "MemberProfiles"`),
      q(`SELECT COALESCE("plan", 'Discover') AS plan, COUNT(*) AS n FROM "MemberProfiles" GROUP BY 1`),
      q(`SELECT COALESCE(SUM(CASE "plan" WHEN 'Essential' THEN 4 WHEN 'Plus' THEN 9.99 WHEN 'Elite' THEN 19.99 ELSE 0 END),0) AS n FROM "MemberProfiles"`),
      q(`SELECT COALESCE(SUM("amount"),0) AS n FROM "Payments" WHERE "status" IN ('Succeeded','Simulated')`),
      q(`SELECT COUNT(*) AS n FROM "Courses"`),
      q(`SELECT COUNT(*) AS n FROM "Lessons"`),
      q(`SELECT COUNT(*) AS n FROM "WatchHistory"`),
      q(`SELECT COUNT(*) AS n FROM "SupportTickets" WHERE "status" <> 'Resolved' OR "status" IS NULL`),
      q(`SELECT COUNT(*) AS n FROM "RewardsLedger" WHERE "status" = 'Pending'`),
      q(`SELECT COUNT(*) AS n FROM "CommunityPosts" WHERE "moderationStatus" = 'Reported'`),
      q(`SELECT COUNT(*) AS n, COUNT(*) FILTER (WHERE "completed") AS done FROM "Enrollments"`),
      q(`SELECT "category", COUNT(*) AS n FROM "Courses" GROUP BY 1 ORDER BY 2 DESC`),
    ]);
    return {
      members: num(m[0]?.n), mrr: num(mrr[0]?.n), collected: num(paid[0]?.n), courses: num(c[0]?.n), lessons: num(l[0]?.n), videoViews: num(wh[0]?.n),
      openTickets: num(t[0]?.n), pendingRewards: num(rw[0]?.n), reportedPosts: num(rp[0]?.n), enrollments: num(en[0]?.n), completions: num(en[0]?.done),
      planMix: ['Discover', 'Essential', 'Plus', 'Elite'].map((p) => ({ plan: p, count: num(plans.find((r) => r.plan === p)?.n) })),
      categoryMix: cats.map((r) => ({ category: String(r.category ?? 'Other'), count: num(r.n) })),
    };
  },
});
