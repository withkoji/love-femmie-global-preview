import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@project/components/ui/badge';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import type { ListQueuesOutputType } from 'zitejs/api';
import DataTable, { type Col } from '../components/DataTable';
import { useQueues } from '../lib/useQueues';

type R = ListQueuesOutputType['rewards'][0];
type F = ListQueuesOutputType['referrals'][0];

export default function Rewards() {
  const { data, act } = useQueues();
  const [pendingOnly, setPendingOnly] = useState(true);
  const rc = useMemo<Col<R>[]>(() => [
    { key: 'd', label: 'Date', render: (r) => r.createdAt && format(new Date(r.createdAt), 'MMM d, yyyy'), sort: (r) => r.createdAt },
    { key: 'm', label: 'Member', render: (r) => r.email },
    { key: 'r', label: 'Reason', render: (r) => r.reason },
    { key: 'p', label: 'Points', render: (r) => `+${r.points}`, sort: (r) => r.points },
    { key: 's', label: 'Status', render: (r) => <Badge variant="secondary">{r.status}</Badge> },
    { key: 'x', label: '', render: (r) => r.status === 'Pending' && <div className="flex gap-2"><Button size="sm" onClick={() => act({ kind: 'reward', id: r.id, status: 'Approved' })}>Approve</Button><Button size="sm" variant="outline" onClick={() => act({ kind: 'reward', id: r.id, status: 'Rejected' })}>Reject</Button></div> },
  ], [act]);
  const fc = useMemo<Col<F>[]>(() => [
    { key: 'd', label: 'Date', render: (r) => r.createdAt && format(new Date(r.createdAt), 'MMM d, yyyy'), sort: (r) => r.createdAt },
    { key: 'c', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'a', label: 'Referrer', render: (r) => r.referrer },
    { key: 'b', label: 'New member', render: (r) => r.referred },
    { key: 's', label: 'Status', render: (r) => <Badge variant="secondary">{r.status}</Badge> },
    { key: 'x', label: '', render: (r) => r.status === 'Pending' && <div className="flex gap-2"><Button size="sm" onClick={() => act({ kind: 'referral', id: r.id, status: 'Qualified' })}>Qualify</Button><Button size="sm" variant="outline" onClick={() => act({ kind: 'referral', id: r.id, status: 'Rejected' })}>Reject</Button></div> },
  ], [act]);
  if (!data) return <Skeleton className="h-96 rounded-2xl" />;
  const rewards = pendingOnly ? data.rewards.filter((r) => r.status === 'Pending') : data.rewards;
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-secondary p-3 text-sm text-muted-foreground">Anti-fraud: referral points stay Pending until approved here. Check that the referrer and new member are different people before qualifying. Cashback is disabled.</p>
      <Tabs defaultValue="rewards">
        <TabsList><TabsTrigger value="rewards">Rewards ledger</TabsTrigger><TabsTrigger value="referrals">Referrals ({data.referrals.length})</TabsTrigger></TabsList>
        <TabsContent value="rewards"><DataTable rows={rewards} cols={rc} search={(r) => `${r.email} ${r.reason} ${r.status}`} toolbar={<Button size="sm" variant="outline" onClick={() => setPendingOnly(!pendingOnly)}>{pendingOnly ? 'Show all' : 'Pending only'}</Button>} /></TabsContent>
        <TabsContent value="referrals"><DataTable rows={data.referrals} cols={fc} search={(r) => `${r.code} ${r.referrer} ${r.referred} ${r.status}`} /></TabsContent>
      </Tabs>
    </div>
  );
}
