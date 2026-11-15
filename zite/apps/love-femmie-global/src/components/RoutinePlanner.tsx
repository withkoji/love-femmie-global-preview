import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { manageRoutine, type ManageRoutineOutputType, type ManageRoutineInputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Checkbox } from '@project/components/ui/checkbox';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';

const KINDS = ['Meal', 'Sleep', 'Exercise', 'Skincare', 'Prayer/Reflection', 'Hydration', 'Cleaning', 'Family', 'Pet Care', 'Other'];
type Items = ManageRoutineOutputType['items'];

export default function RoutinePlanner() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [items, setItems] = useState<Items | null>(null);
  const [time, setTime] = useState('12:00');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState('Other');
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (args: Omit<ManageRoutineInputType, 'today'>) => {
    try { setItems((await manageRoutine({ ...args, today })).items); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not update planner'); }
  }, [today]);
  useEffect(() => { run({ action: 'list' }); }, [run]);
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (!label.trim()) return; setBusy(true); await run({ action: 'add', activity: label, schedule: time, kind }); setLabel(''); setBusy(false); };
  const toggle = (id: string) => { setItems((p) => p?.map((i) => (i.id === id ? { ...i, doneToday: !i.doneToday } : i)) ?? null); run({ action: 'toggle', id }); };
  const remove = (id: string) => { setItems((p) => p?.filter((i) => i.id !== id) ?? null); run({ action: 'delete', id }); };
  const done = items?.filter((i) => i.doneToday).length ?? 0;
  return (
    <div className="max-w-2xl rounded-2xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">Today · {done}/{items?.length ?? 0} done. Meals, sleep, exercise, skincare, prayer/reflection and more.</p>
      <form onSubmit={add} className="mt-4 flex flex-wrap gap-2">
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
        <Input value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} placeholder="Add an activity" className="min-w-[160px] flex-1" />
        <Select value={kind} onValueChange={setKind}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
        <Button type="submit" size="icon" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}</Button>
      </form>
      {!items ? <Skeleton className="mt-4 h-48" /> : (
        <ul className="mt-4 divide-y">{items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 py-2.5">
            <Checkbox checked={i.doneToday} onCheckedChange={() => toggle(i.id)} />
            <span className="w-14 font-display text-lg font-semibold text-gold">{i.schedule}</span>
            <span className={i.doneToday ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>{i.activity}<span className="ml-2 text-xs text-muted-foreground">{i.kind}</span></span>
            <Button size="icon" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4" /></Button>
          </li>))}
        </ul>)}
    </div>
  );
}
