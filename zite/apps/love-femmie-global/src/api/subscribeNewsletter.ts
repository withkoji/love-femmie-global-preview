import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Subscribes an email address to the newsletter',
  inputSchema: z.object({ email: z.string() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input }) => {
    const email = input.email.trim().toLowerCase();
    if (!z.string().email().safeParse(email).success) throw new Error('Please enter a valid email');
    await zite.newsletterSubscribers.bulkCreate({ records: [{ email }], matchOn: ['email'] });
    return { ok: true };
  },
});
