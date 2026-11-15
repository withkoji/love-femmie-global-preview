import { useState } from 'react';
import { toast } from 'sonner';
import { updateProfile } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Switch } from '@project/components/ui/switch';
import { Textarea } from '@project/components/ui/textarea';
import { useData } from '../lib/data';

export default function ProfileForm() {
  const { me, refreshMe } = useData();
  const [f, setF] = useState({ displayName: me?.profile.displayName ?? '', country: me?.profile.country ?? '', language: me?.profile.language ?? '', interests: me?.profile.interests ?? '', kidsMode: me?.profile.kidsMode ?? false });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.displayName.trim()) return setErr('Display name is required');
    setErr(''); setBusy(true);
    try { await updateProfile(f); await refreshMe(); toast.success('Profile saved'); } catch { toast.error('Could not save profile'); } finally { setBusy(false); }
  };
  const field = (k: 'displayName' | 'country' | 'language', label: string) => <div className="space-y-1.5"><Label>{label}</Label><Input value={f[k]} maxLength={60} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>;
  return (
    <form onSubmit={save} className="max-w-xl space-y-4 rounded-2xl border bg-card p-6">
      {field('displayName', 'Display name')}{err && <p className="text-sm text-destructive">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{field('country', 'Country')}{field('language', 'Language')}</div>
      <div className="space-y-1.5"><Label>Learning interests</Label><Textarea value={f.interests} maxLength={500} onChange={(e) => setF({ ...f, interests: e.target.value })} placeholder="Cooking, skincare, parenting…" /></div>
      <div className="flex items-start justify-between gap-4 rounded-xl bg-muted p-4">
        <div><p className="font-medium">Kids Mode (parental control)</p><p className="text-sm text-muted-foreground">Shows only Kids and All Ages videos and turns off community posting on this account.</p></div>
        <Switch checked={f.kidsMode} onCheckedChange={(v) => setF({ ...f, kidsMode: v })} />
      </div>
      <Button type="submit" disabled={busy} className="rounded-full">{busy ? 'Saving…' : 'Save profile'}</Button>
    </form>
  );
}
