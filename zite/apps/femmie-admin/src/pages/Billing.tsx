import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { listBilling, billingAction, type ListBillingOutputType } from 'zitejs/api';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import DataTable, { type Col } from '../components/DataTable';
import ConfirmButton from '../components/ConfirmButton';

type P = ListBillingOutputType['payments'][0];
type S = ListBillingOutputType['subscriptions'][0];
const d = (s: string | null) => (s ? format(new Date(s), 'MMM d, yyyy') : '—');

export default function Billing() {
  const [data, setData] = useState<ListBillingOutputType | null>(null);
  const load = () => listBilling({}).then(setData);
  useEffect(() => { load(); }, []);
  const act = async (kind: 'refund' | 'cancel', id: string) => { try { await billingAction({ kind, id }); toast.success(kind === 'refund' ? 'Marked refunded' : 'Subscription canceled'); load(); } catch { toast.error('Action failed'); } };
  const pc = useMemo<Col<P>[]>(() => [
    { key: 'd', label: 'Date', render: (r) => d(r.createdAt), sort: (r) => r.createdAt },
    { key: 'm', label: 'Member', render: (r) => r.email },
    { key: 'desc', label: 'Description', render: (r) => r.description },
    { key: 'a', label: 'Amount', render: (r) => `$${r.amount.toFixed(2)} ${r.currency}`, sort: (r) => r.amount },
    { key: 's', label: 'Status', render: (r) => <Badge variant={r.status === 'Refunded' ? 'outline' : 'secondary'}>{r.status}</Badge> },
    { key: 'ref', label: 'Reference', render: (r) => <span className="font-mono text-xs">{r.ref}</span> },
    { key: 'x', label: '', render: (r) => r.status !== 'Refunded' && <ConfirmButton label="Refund" title="Mark payment refunded?" description="Records a refund on this payment. No money moves until a live payment provider is connected." onConfirm={() => act('refund', r.id)} /> },
  ], []);
  const sc = useMemo<Col<S>[]>(() => [
    { key: 'l', label: 'Subscription', render: (r) => r.label, sort: (r) => r.label },
    { key: 'm', label: 'Member', render: (r) => r.email },
    { key: 's', label: 'Status', render: (r) => <Badge variant="secondary">{r.status}</Badge>, sort: (r) => r.status },
    { key: 'r', label: 'Renews', render: (r) => d(r.renewalDate), sort: (r) => r.renewalDate ?? '' },
    { key: 'c', label: 'Started', render: (r) => d(r.createdAt), sort: (r) => r.createdAt },
    { key: 'x', label: '', render: (r) => ['Active', 'Trialing'].includes(r.status) && <ConfirmButton label="Cancel" title="Cancel subscription?" description="The subscription will be marked canceled." onConfirm={() => act('cancel', r.id)} /> },
  ], []);
  if (!data) return <Skeleton className="h-96 rounded-2xl" />;
  return (
    <Tabs defaultValue="subs">
      <TabsList><TabsTrigger value="subs">Subscriptions ({data.subscriptions.length})</TabsTrigger><TabsTrigger value="pay">Payments ({data.payments.length})</TabsTrigger></TabsList>
      <TabsContent value="subs"><DataTable rows={data.subscriptions} cols={sc} search={(r) => `${r.label} ${r.email} ${r.status}`} /></TabsContent>
      <TabsContent value="pay"><DataTable rows={data.payments} cols={pc} search={(r) => `${r.email} ${r.description} ${r.ref} ${r.status}`} /></TabsContent>
    </Tabs>
  );
}
