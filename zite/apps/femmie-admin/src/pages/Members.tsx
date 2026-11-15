import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { listMembers, updateMember, type ListMembersOutputType, type UpdateMemberInputType } from 'zitejs/api';
import { Badge } from '@project/components/ui/badge';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Switch } from '@project/components/ui/switch';
import { Skeleton } from '@project/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import DataTable, { type Col } from '../components/DataTable';

type M = ListMembersOutputType['members'][0];

export default function Members() {
  const [rows, setRows] = useState<M[] | null>(null);
  const [edit, setEdit] = useState<UpdateMemberInputType & { name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => listMembers({}).then((r) => setRows(r.members));
  useEffect(() => { load(); }, []);
  const cols = useMemo<Col<M>[]>(() => [
    { key: 'name', label: 'Member', render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>, sort: (r) => r.name },
    { key: 'plan', label: 'Plan', render: (r) => <Badge variant="secondary">{r.plan}</Badge>, sort: (r) => r.plan },
    { key: 'role', label: 'Role', render: (r) => r.role, sort: (r) => r.role },
    { key: 'country', label: 'Country', render: (r) => r.country || '—' },
    { key: 'points', label: 'Points', render: (r) => r.points, sort: (r) => r.points },
    { key: 'kids', label: 'Kids mode', render: (r) => (r.kidsMode ? 'On' : '—') },
    { key: 'act', label: '', render: (r) => <Button size="sm" variant="outline" onClick={() => setEdit({ id: r.id, name: r.name, plan: r.plan as UpdateMemberInputType['plan'], role: r.role as UpdateMemberInputType['role'], kidsMode: r.kidsMode })}>Edit</Button> },
  ], []);
  const save = async () => {
    if (!edit) return;
    setBusy(true);
    try { const { name: _n, ...input } = edit; await updateMember(input); toast.success('Member updated'); setEdit(null); load(); } catch { toast.error('Update failed'); } finally { setBusy(false); }
  };
  if (!rows) return <Skeleton className="h-96 rounded-2xl" />;
  return (
    <>
      <DataTable rows={rows} cols={cols} search={(r) => `${r.name} ${r.email} ${r.plan} ${r.role} ${r.country}`} />
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {edit?.name}</DialogTitle></DialogHeader>
          {edit && <div className="space-y-4">
            <div className="space-y-1.5"><Label>Plan</Label><Select value={edit.plan} onValueChange={(v) => setEdit({ ...edit, plan: v as typeof edit.plan })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Discover', 'Essential', 'Plus', 'Elite'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Role</Label><Select value={edit.role} onValueChange={(v) => setEdit({ ...edit, role: v as typeof edit.role })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Member', 'Parent', 'Creator', 'Admin'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center justify-between"><Label>Kids Mode</Label><Switch checked={edit.kidsMode} onCheckedChange={(v) => setEdit({ ...edit, kidsMode: v })} /></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
