import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@project/components/ui/input';
import { Skeleton } from '@project/components/ui/skeleton';
import { useData } from '../lib/data';

export function BlogPost() {
  const { id } = useParams();
  const { catalog } = useData();
  const a = catalog?.articles.find((x) => x.id === id);
  if (!catalog) return <div className="mx-auto max-w-3xl px-4 py-12"><Skeleton className="h-96" /></div>;
  if (!a) return <p className="py-24 text-center text-muted-foreground">Article not found. <Link to="/blog" className="text-primary">Back to the journal</Link></p>;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Journal</Link>
      <p className="text-xs uppercase tracking-widest text-gold">{a.category}</p>
      <h1 className="text-5xl font-semibold leading-tight">{a.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{a.author}{a.createdAt && ` · ${format(new Date(a.createdAt), 'MMMM d, yyyy')}`}</p>
      <img src={a.image} alt="" className="mt-6 aspect-video w-full rounded-3xl object-cover" />
      <div className="mt-6 space-y-4 text-lg leading-relaxed">{a.body.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
    </article>
  );
}

export default function Blog() {
  const { catalog } = useData();
  const [q, setQ] = useState('');
  const list = (catalog?.articles ?? []).filter((a) => `${a.title} ${a.category} ${a.excerpt}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Blog & Articles</p>
      <h1 className="text-5xl font-semibold">The FEMMIE Journal</h1>
      <div className="relative mt-6 max-w-md"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories" className="pl-9" /></div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {!catalog ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />) : list.map((a) => (
          <Link key={a.id} to={`/blog/${a.id}`} className="group overflow-hidden rounded-2xl border bg-card transition hover:shadow-lg">
            <div className="aspect-[4/3] overflow-hidden"><img src={a.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /></div>
            <div className="p-5"><p className="text-xs uppercase tracking-widest text-gold">{a.category}</p><h3 className="text-2xl font-semibold">{a.title}</h3><p className="mt-1 text-sm text-muted-foreground">{a.excerpt}</p></div>
          </Link>))}
      </div>
      {catalog && !list.length && <p className="py-16 text-center text-muted-foreground">No stories match.</p>}
    </div>
  );
}
