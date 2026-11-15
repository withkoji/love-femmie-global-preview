import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Opens a support ticket for the signed-in member',
  authenticated: true,
  inputSchema: z.object({ subject: z.string().min(3).max(120), message: z.string().min(10).max(3000) }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.subject.trim().length < 3 || input.message.trim().length < 10) throw new Error('Please add a subject and a short description');
    await zite.supportTickets.create({ record: { subject: input.subject.trim(), message: input.message.trim(), member: context.user.id, status: 'Open' } });
    return { ok: true };
  },
});
