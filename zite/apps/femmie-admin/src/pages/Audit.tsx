import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, CircleDashed } from 'lucide-react';
import { listAudit, type ListAuditOutputType } from 'zitejs/api';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import DataTable, { type Col } from '../components/DataTable';

type A = ListAuditOutputType['activity'][0];
type E = ListAuditOutputType['events'][0];
const STATUS: [string, boolean, string][] = [['Zite database & apps', true, '24 tables connected'], ['Authentication', true, 'Email-code sign-in'], ['Stripe payments', false, 'Simulated checkout'], ['Video hosting', false, 'Demo media'], ['Email provider', false, 'Not connected'], ['Google Analytics', false, 'Not connected']];

export default function Audit() {
  const [d, setD] = useState<ListAuditOutputType | null>(null);
  useEffect(() => { listAudit({}).then(setD); }, []);
  const ac = useMemo<Col<A>[]>(() => [
    { key: 't', label: 'When', render: (r) => r.timestamp && format(new Date(r.timestamp), 'MMM d, h:mm a'), sort: (r) => r.timestamp },
    { key: 'a', label: 'Admin', render: (r) => r.admin },
    { key: 'x', label: 'Action', render: (r) => <span className="font-mono text-xs">{r.action}</span>, sort: (r) => r.action },
    { key: 'd', label: 'Details', render: (r) => <span className="text-sm text-muted-foreground">{r.details}</span> },
  ], []);
  const ec = useMemo<Col<E>[]>(() => [
    { key: 't', label: 'When', render: (r) => r.createdAt && format(new Date(r.createdAt), 'MMM d, h:mm a'), sort: (r) => r.createdAt },
    { key: 'p', label: 'Provider', render: (r) => r.provider },
    { key: 'e', label: 'Event', render: (r) => <span className="font-mono text-xs">{r.eventType}</span> },
    { key: 's', label: 'Status', render: (r) => <Badge variant="secondary">{r.status}</Badge> },
  ], []);
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{STATUS.map(([n, ok, s]) => <div key={n} className="flex items-center gap-3 rounded-2xl border bg-card p-4">{ok ? <CheckCircle2 className="h-5 w-5 text-botanical" /> : <CircleDashed className="h-5 w-5 text-muted-foreground" />}<div><p className="font-medium">{n}</p><p className="text-xs text-muted-foreground">{s}</p></div></div>)}</div>
      {!d ? <Skeleton className="h-96 rounded-2xl" /> : (
        <Tabs defaultValue="activity">
          <TabsList><TabsTrigger value="activity">Admin activity</TabsTrigger><TabsTrigger value="events">Integration events</TabsTrigger></TabsList>
          <TabsContent value="activity"><DataTable rows={d.activity} cols={ac} search={(r) => `${r.admin} ${r.action} ${r.details}`} /></TabsContent>
          <TabsContent value="events"><DataTable rows={d.events} cols={ec} search={(r) => `${r.provider} ${r.eventType} ${r.status}`} /></TabsContent>
        </Tabs>)}
    </div>
  );
}
