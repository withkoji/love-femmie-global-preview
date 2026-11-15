import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@project/components/ui/badge';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import type { ListQueuesOutputType } from 'zitejs/api';
import DataTable, { type Col } from '../components/DataTable';
import ConfirmButton from '../components/ConfirmButton';
import { useQueues } from '../lib/useQueues';

type P = ListQueuesOutputType['posts'][0];

export default function Moderation() {
  const { data, act } = useQueues();
  const [reportedOnly, setReportedOnly] = useState(true);
  const cols = useMemo<Col<P>[]>(() => [
    { key: 'd', label: 'Date', render: (r) => r.createdAt && format(new Date(r.createdAt), 'MMM d'), sort: (r) => r.createdAt },
    { key: 'a', label: 'Author', render: (r) => r.author },
    { key: 'c', label: 'Post', render: (r) => <p className="max-w-md text-sm">{r.content}</p> },
    { key: 't', label: 'Topic', render: (r) => r.topic },
    { key: 's', label: 'Status', render: (r) => <Badge variant={r.status === 'Reported' ? 'destructive' : 'secondary'}>{r.status}</Badge> },
    { key: 'x', label: '', render: (r) => <div className="flex gap-2">{r.status !== 'Approved' && <Button size="sm" variant="outline" onClick={() => act({ kind: 'post', id: r.id, status: 'Approved' })}>Restore</Button>}{r.status !== 'Removed' && <ConfirmButton label="Remove" title="Remove post?" description="The post will be hidden from the community." onConfirm={() => act({ kind: 'post', id: r.id, status: 'Removed' })} />}</div> },
  ], [act]);
  if (!data) return <Skeleton className="h-96 rounded-2xl" />;
  const rows = reportedOnly ? data.posts.filter((p) => p.status === 'Reported') : data.posts;
  return <DataTable rows={rows} cols={cols} search={(r) => `${r.author} ${r.content} ${r.topic}`} toolbar={<Button size="sm" variant="outline" onClick={() => setReportedOnly(!reportedOnly)}>{reportedOnly ? 'Show all posts' : 'Reported only'}</Button>} />;
}
