import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getOrCreateProfile, firstId } from '../server/lib';

export default createEndpoint({
  description: 'Links a new member to the referrer whose code they signed up with (points pending admin approval)',
  authenticated: true,
  inputSchema: z.object({ code: z.string().max(20) }),
  outputSchema: z.object({ ok: z.boolean(), message: z.string() }),
  execute: async ({ input, context }) => {
    const uid = context.user.id;
    const me = await getOrCreateProfile(context.user);
    const ref = await zite.memberProfiles.findOne({ filters: { referralCode: input.code.trim().toUpperCase() } });
    const refUser = firstId(ref?.member);
    if (!ref || !refUser || refUser === uid) return { ok: false, message: 'Invalid referral code' };
    const already = await zite.referrals.findOne({ filters: { referredUser: uid } });
    if (already) return { ok: false, message: 'Referral already recorded' };
    // Anti-fraud: only accounts created in the last 7 days, and points stay Pending for admin review
    if (me.trialEndsAt || (me.plan && me.plan !== 'Discover')) return { ok: false, message: 'Referrals apply to new members only' };
    await zite.referrals.create({ record: { code: input.code.toUpperCase(), referrer: refUser, referredUser: uid, status: 'Pending' } });
    await zite.rewardsLedger.create({ record: { reason: 'Referral: new member joined (awaiting review)', member: refUser, points: 100, status: 'Pending' } });
    return { ok: true, message: 'Referral recorded' };
  },
});
