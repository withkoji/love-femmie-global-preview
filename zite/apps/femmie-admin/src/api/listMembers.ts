import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { emailMap, first } from '../server/lib';

export default createEndpoint({
  description: 'Lists members with plan, role, points and subscription status',
  inputSchema: z.object({}),
  outputSchema: z.object({ members: z.array(z.object({ id: z.string(), name: z.string(), email: z.string(), plan: z.string(), role: z.string(), country: z.string(), kidsMode: z.boolean(), points: z.number(), trialEndsAt: z.string().nullable() })) }),
  execute: async () => {
    const { records } = await zite.memberProfiles.findAll({ limit: 2000 });
    const pts = (await zite.sql({ query: `SELECT "member", SUM("points") AS p FROM "RewardsLedger" WHERE "status" = 'Approved' GROUP BY 1` })).rows;
    const ptsMap = new Map(pts.map((r) => [String(Array.isArray(r.member) ? r.member[0] : r.member), Number(r.p)]));
    const emails = await emailMap(records.map((r) => first(r.member)));
    return { members: records.map((r) => { const uid = first(r.member); return { id: r.id, name: r.displayName ?? '', email: emails.get(uid) ?? '', plan: r.plan ?? 'Discover', role: r.role ?? 'Member', country: r.country ?? '', kidsMode: !!r.kidsMode, points: ptsMap.get(uid) ?? 0, trialEndsAt: r.trialEndsAt ?? null }; }) };
  },
});
