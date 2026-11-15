import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { cn } from '@project/components/lib/utils';
import { useData } from '../lib/data';
import CourseCard from '../components/CourseCard';

const CATS = ['Cooking', 'Nutrition', 'Skincare', 'Home Care', 'Parenting', 'Emotional Wellness', "Children's Activities", 'Pet Care', 'Daily Routines', 'Personal Development'];

export default function Academy() {
  const { catalog } = useData();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '', cat = params.get('cat') ?? '', level = params.get('level') ?? 'all';
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p, { replace: true }); };
  const list = useMemo(() => (catalog?.courses ?? []).filter((c) =>
    (!cat || c.category === cat) && (level === 'all' || c.difficulty === level) &&
    (!q || `${c.title} ${c.instructor} ${c.category}`.toLowerCase().includes(q.toLowerCase()))), [catalog, q, cat, level]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">FEMMIE Academy</p>
      <h1 className="text-5xl font-semibold">Skills for a beautiful life</h1>
      <p className="mt-2 text-muted-foreground">{catalog?.courses.length ?? '…'} courses available in this preview · growing to 1,000 learning items</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search by title, instructor or topic" className="pl-9" /></div>
        <Select value={level} onValueChange={(v) => set('level', v === 'all' ? '' : v)}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All levels</SelectItem><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['', ...CATS].map((c) => <button key={c} onClick={() => set('cat', c)} className={cn('rounded-full border px-3 py-1 text-sm transition', cat === c ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent')}>{c || 'All'}</button>)}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {!catalog ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />) : list.map((c) => <CourseCard key={c.id} c={c} />)}
      </div>
      {catalog && !list.length && <p className="py-16 text-center text-muted-foreground">No courses match your search.</p>}
    </div>
  );
}
