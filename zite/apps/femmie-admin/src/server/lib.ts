import { zite } from 'zitejs/db';

export async function logAdmin(adminId: string, action: string, details: string) {
  await zite.adminActivity.create({ record: { admin: adminId, action, details } });
}

export const first = (v: string | string[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export async function emailMap(ids: string[]) {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return new Map<string, string>();
  const { records } = await zite.auth.findAllUsers({ filters: { id: { in: uniq } }, limit: 2000 });
  return new Map(records.map((u) => [u.id, u.email]));
}
