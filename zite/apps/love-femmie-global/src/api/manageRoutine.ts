import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

const item = z.object({ id: z.string(), activity: z.string(), schedule: z.string(), kind: z.string(), doneToday: z.boolean() });

export default createEndpoint({
  description: "Lists, adds, toggles or deletes the member's daily routine items",
  authenticated: true,
  inputSchema: z.object({
    action: z.enum(['list', 'add', 'toggle', 'delete']),
    id: z.string().optional(),
    activity: z.string().max(80).optional(),
    schedule: z.string().max(10).optional(),
    kind: z.string().optional(),
    today: z.string(),
  }),
  outputSchema: z.object({ items: z.array(item) }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    const mine = async (id?: string) => { const r = id ? await zite.dailyRoutines.findOne({ id }) : undefined; if (!r || ![r.member].flat().includes(uid)) throw new Error('Not found'); return r; };
    if (input.action === 'add') {
      if (!input.activity?.trim()) throw new Error('Activity is required');
      await zite.dailyRoutines.create({ record: { member: uid, activity: input.activity.trim(), schedule: input.schedule ?? '08:00', kind: input.kind ?? 'Other' } });
    } else if (input.action === 'toggle') {
      const r = await mine(input.id);
      await zite.dailyRoutines.update({ id: r.id, record: { doneDate: r.doneDate === input.today ? '' : input.today } });
    } else if (input.action === 'delete') {
      const r = await mine(input.id);
      await zite.dailyRoutines.delete({ id: r.id });
    }
    let { records } = await zite.dailyRoutines.findAll({ filters: { member: uid }, limit: 200 });
    if (!records.length && input.action === 'list') {
      const D: [string, string, string][] = [['06:30', 'Wake up & stretch', 'Sleep'], ['07:00', 'Prayer or reflection', 'Prayer/Reflection'], ['07:30', 'Breakfast', 'Meal'], ['10:00', 'Hydration check', 'Hydration'], ['17:00', 'Exercise or walk', 'Exercise'], ['18:30', 'Family dinner', 'Family'], ['21:00', 'Skincare ritual', 'Skincare'], ['22:00', 'Sleep', 'Sleep']];
      records = (await zite.dailyRoutines.bulkCreate({ records: D.map(([schedule, activity, kind]) => ({ member: uid, schedule, activity, kind })) })).records;
    }
    return { items: records.map((r) => ({ id: r.id, activity: r.activity ?? '', schedule: r.schedule ?? '', kind: r.kind ?? 'Other', doneToday: r.doneDate === input.today })).sort((a, b) => a.schedule.localeCompare(b.schedule)) };
  },
});
