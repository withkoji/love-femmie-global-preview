import { useMemo, useState } from 'react';
import { Clock, Search } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { cn } from '@project/components/lib/utils';
import { useData, type Recipe } from '../lib/data';
import RecipeDialog from '../components/RecipeDialog';

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage'];

export default function Recipes() {
  const { catalog, me } = useData();
  const [q, setQ] = useState('');
  const [cont, setCont] = useState('');
  const [meal, setMeal] = useState('all');
  const [time, setTime] = useState('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [open, setOpen] = useState<Recipe | null>(null);
  const list = useMemo(() => (catalog?.recipes ?? []).filter((r) =>
    (!cont || r.continent === cont) && (meal === 'all' || r.mealType === meal) &&
    (time === 'all' || r.prepMinutes + r.cookMinutes <= Number(time)) &&
    (!savedOnly || me?.profile.savedRecipes.includes(r.id)) &&
    (!q || `${r.title} ${r.country} ${r.ingredients} ${r.dietTags}`.toLowerCase().includes(q.toLowerCase()))), [catalog, q, cont, meal, time, savedOnly, me]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">International Food</p>
      <h1 className="text-5xl font-semibold">World Recipes</h1>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dish, country, ingredient or diet" className="pl-9" /></div>
        <Select value={meal} onValueChange={setMeal}><SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any meal</SelectItem>{MEALS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
        <Select value={time} onValueChange={setTime}><SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any time</SelectItem><SelectItem value="30">Under 30 min</SelectItem><SelectItem value="60">Under 1 hour</SelectItem></SelectContent></Select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['', ...CONTINENTS].map((c) => <button key={c} onClick={() => setCont(c)} className={cn('rounded-full border px-3 py-1 text-sm', cont === c ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent')}>{c || 'All continents'}</button>)}
        {me && <button onClick={() => setSavedOnly(!savedOnly)} className={cn('rounded-full border px-3 py-1 text-sm', savedOnly ? 'border-gold bg-gold text-white' : 'hover:bg-accent')}>My saved</button>}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {!catalog ? [...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />) : list.map((r) => (
          <button key={r.id} onClick={() => setOpen(r)} className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="aspect-[4/3] overflow-hidden"><img src={r.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /></div>
            <div className="p-4"><p className="text-xs uppercase tracking-widest text-gold">{r.country}</p><h3 className="text-xl font-semibold">{r.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{r.prepMinutes + r.cookMinutes} min · {r.mealType}</p></div>
          </button>))}
      </div>
      {catalog && !list.length && <p className="py-16 text-center text-muted-foreground">No recipes match these filters.</p>}
      <RecipeDialog recipe={open} onClose={() => setOpen(null)} />
    </div>
  );
}
