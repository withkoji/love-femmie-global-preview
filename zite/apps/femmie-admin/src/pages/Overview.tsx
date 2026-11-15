import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getOverview, type GetOverviewOutputType } from 'zitejs/api';
import { Skeleton } from '@project/components/ui/skeleton';

const COLORS = ['hsl(var(--chart-5))', 'hsl(var(--chart-3))', 'hsl(var(--chart-2))', 'hsl(var(--chart-1))'];
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function Overview() {
  const [d, setD] = useState<GetOverviewOutputType | null>(null);
  useEffect(() => { getOverview({}).then(setD); }, []);
  if (!d) return <div className="grid gap-4 md:grid-cols-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>;
  const kpis: [string, string, string?][] = [
    ['Members', d.members.toLocaleString()], ['Monthly recurring (plans)', usd(d.mrr), 'based on current plans'], ['Collected (simulated)', usd(d.collected)], ['Courses', `${d.courses}`, `${d.lessons} lessons`],
    ['Video sessions', d.videoViews.toLocaleString()], ['Enrollments', `${d.enrollments}`, `${d.completions} completed`], ['Pending rewards', `${d.pendingRewards}`], ['Open tickets / reports', `${d.openTickets} / ${d.reportedPosts}`],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kpis.map(([l, v, s]) => <div key={l} className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-4xl font-bold">{v}</p>{s && <p className="text-xs text-muted-foreground">{s}</p>}</div>)}</div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border bg-card p-5"><p className="font-semibold">Membership distribution</p>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={d.planMix} dataKey="count" nameKey="plan" innerRadius={55} outerRadius={90}>{d.planMix.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">{d.planMix.map((p, i) => <span key={p.plan} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />{p.plan} ({p.count})</span>)}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5"><p className="font-semibold">Courses by category</p>
          <div className="h-72"><ResponsiveContainer><BarChart data={d.categoryMix} layout="vertical" margin={{ left: 40 }}><XAxis type="number" hide /><YAxis type="category" dataKey="category" width={140} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
}
