import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';

export type Col<T> = { key: string; label: string; render: (r: T) => ReactNode; sort?: (r: T) => string | number };

export default function DataTable<T extends { id: string }>({ rows, cols, search, toolbar, pageSize = 15 }: { rows: T[]; cols: Col<T>[]; search: (r: T) => string; toolbar?: ReactNode; pageSize?: number }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const list = useMemo(() => {
    let l = rows.filter((r) => search(r).toLowerCase().includes(q.toLowerCase()));
    const c = sort && cols.find((x) => x.key === sort.key);
    if (c?.sort) l = [...l].sort((a, b) => (c.sort!(a) > c.sort!(b) ? 1 : -1) * sort!.dir);
    return l;
  }, [rows, q, sort, cols, search]);
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const p = Math.min(page, pages - 1);
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search" className="pl-9" /></div>
        <span className="text-sm text-muted-foreground">{list.length} records</span>
        <div className="ml-auto flex gap-2">{toolbar}</div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>{cols.map((c) => <TableHead key={c.key}>{c.sort ? <button className="flex items-center gap-1" onClick={() => setSort({ key: c.key, dir: sort?.key === c.key && sort.dir === 1 ? -1 : 1 })}>{c.label}<ArrowUpDown className="h-3 w-3" /></button> : c.label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {list.slice(p * pageSize, (p + 1) * pageSize).map((r) => <TableRow key={r.id}>{cols.map((c) => <TableCell key={c.key}>{c.render(r)}</TableCell>)}</TableRow>)}
            {!list.length && <TableRow><TableCell colSpan={cols.length} className="py-10 text-center text-muted-foreground">Nothing here.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 border-t p-3 text-sm">
        <span className="text-muted-foreground">Page {p + 1} of {pages}</span>
        <Button size="sm" variant="outline" disabled={p === 0} onClick={() => setPage(p - 1)}>Prev</Button>
        <Button size="sm" variant="outline" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Next</Button>
      </div>
    </div>
  );
}
