import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import type { ListQueuesOutputType } from 'zitejs/api';
import DataTable, { type Col } from '../components/DataTable';
import { useQueues } from '../lib/useQueues';

type T = ListQueuesOutputType['tickets'][0];
type St = 'Open' | 'In Progress' | 'Resolved';

export default function Support() {
  const { data, act } = useQueues();
  const [view, setView] = useState<T | null>(null);
  const cols = useMemo<Col<T>[]>(() => [
    { key: 'd', label: 'Opened', render: (r) => r.createdAt && format(new Date(r.createdAt), 'MMM d, h:mm a'), sort: (r) => r.createdAt },
    { key: 'm', label: 'Member', render: (r) => r.email },
    { key: 's', label: 'Subject', render: (r) => <button className="text-left font-medium text-primary hover:underline" onClick={() => setView(r)}>{r.subject}</button>, sort: (r) => r.subject },
    { key: 'st', label: 'Status', render: (r) => <Select value={r.status} onValueChange={(v) => act({ kind: 'ticket', id: r.id, status: v as St })}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger><SelectContent>{['Open', 'In Progress', 'Resolved'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>, sort: (r) => r.status },
  ], [act]);
  if (!data) return <Skeleton className="h-96 rounded-2xl" />;
  return (
    <>
      <DataTable rows={data.tickets} cols={cols} search={(r) => `${r.email} ${r.subject} ${r.status}`} />
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.subject}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{view?.email}</p>
          <p className="whitespace-pre-wrap">{view?.message}</p>
          {view && <Button asChild variant="outline"><a href={`mailto:${view.email}?subject=Re: ${encodeURIComponent(view.subject)}`}>Reply by email</a></Button>}
        </DialogContent>
      </Dialog>
    </>
  );
}
