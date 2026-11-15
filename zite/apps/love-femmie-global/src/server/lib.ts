import { zite } from 'zitejs/db';

export const PLAN_RANK: Record<string, number> = { Discover: 0, Essential: 1, Plus: 2, Elite: 3 };
export const canAccess = (userPlan: string, required: string) => (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[required] ?? 0);
export const firstId = (v: string | string[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
const code = () => 'LF' + Math.random().toString(36).slice(2, 8).toUpperCase();

export async function getOrCreateProfile(user: { id: string; firstName?: string | null; email: string }) {
  const existing = await zite.memberProfiles.findOne({ filters: { member: user.id } });
  if (existing) {
    if (!existing.referralCode) {
      const referralCode = code();
      await zite.memberProfiles.update({ id: existing.id, record: { referralCode } });
      return { ...existing, referralCode };
    }
    return existing;
  }
  return zite.memberProfiles.create({ record: { member: user.id, displayName: user.firstName || user.email.split('@')[0], plan: 'Discover', language: 'English', role: 'Member', referralCode: code() } });
}

export async function awardBadge(memberId: string, badge: string) {
  const has = await zite.achievements.findOne({ filters: { member: memberId, badge } });
  if (!has) await zite.achievements.create({ record: { member: memberId, badge } });
}
