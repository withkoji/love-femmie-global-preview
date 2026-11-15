import { useParams, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Play } from 'lucide-react';
import { useData, type Video } from '../lib/data';
import CourseCard from '../components/CourseCard';
import VideoDialog from '../components/VideoDialog';

export const TOPICS: Record<string, { title: string; sub: string; cats: string[]; tv: string[]; image: string }> = {
  beauty: { title: 'Beauty & Skincare', sub: 'Facial routines, natural skincare, product education and beauty tutorials', cats: ['Skincare'], tv: ['Skincare'], image: 'https://images.fillout.com/925440/qjsuad7brz/generated-images/sX9HgY2gZPTPuJChWL7wrZ/img_5jq2TzDfxsT1cEIq.jpg' },
  wellness: { title: 'Health & Wellness', sub: 'Nutrition, hydration, mindfulness, sleep routines and self-care', cats: ['Nutrition', 'Emotional Wellness', 'Daily Routines'], tv: ['Nutrition', 'Wellness'], image: 'https://images.fillout.com/925440/qjsuad7brz/generated-images/sxTqSZxisBSHEJBd1ikbZV/img_14-Tl5cxYBJnlvZ6.jpg' },
  family: { title: 'Family & Parenting', sub: 'Family activities, communication, parenting lessons and relationships', cats: ['Parenting', 'Personal Development'], tv: ['Parenting'], image: 'https://images.fillout.com/925440/qjsuad7brz/generated-images/wRipY12oN1jRU8mx2J1FYF/img_0SaTakuYpjihAPMd.jpg' },
  home: { title: 'Home & Cleaning', sub: 'Cleaning tutorials, home organization and household routines', cats: ['Home Care'], tv: ['Home Organization'], image: 'https://images.fillout.com/925440/qjsuad7brz/generated-images/wLpFwruDmCmKgfGXVf7RoT/img_gcXI6qvSbQLkrcy0.jpg' },
  pets: { title: 'Pet Care', sub: 'Pet training, feeding guidance, grooming and companionship', cats: ['Pet Care'], tv: ['Pet Training'], image: 'https://images.fillout.com/925440/qjsuad7brz/generated-images/uv24DKNZxDDRDXRV2RRiCq/img_h1Fy19PTevyBUITb.jpg' },
};

export default function Topic() {
  const { slug } = useParams();
  const { catalog } = useData();
  const [play, setPlay] = useState<Video | null>(null);
  const t = TOPICS[slug ?? ''];
  if (!t) return <Navigate to="/" replace />;
  const courses = (catalog?.courses ?? []).filter((c) => t.cats.includes(c.category));
  const videos = (catalog?.videos ?? []).filter((v) => t.tv.includes(v.collection));
  const articles = (catalog?.articles ?? []).filter((a) => t.cats.includes(a.category));
  return (
    <>
      <section className="relative h-[42vh] min-h-[320px]">
        <img src={t.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 text-white"><h1 className="text-5xl font-semibold md:text-6xl">{t.title}</h1><p className="mt-2 max-w-xl text-white/85">{t.sub}</p></div>
      </section>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12">
        {videos.length > 0 && <section><h2 className="mb-4 text-3xl font-semibold">Watch on FEMMIE TV</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{videos.map((v) => <button key={v.id} onClick={() => setPlay(v)} className="group text-left"><div className="relative aspect-video overflow-hidden rounded-xl"><img src={v.thumbnail} alt="" className="h-full w-full object-cover" /><Play className="absolute inset-0 m-auto h-10 w-10 fill-white text-white opacity-80" /></div><p className="mt-2 text-sm font-medium">{v.title}</p></button>)}</div></section>}
        {articles.length > 0 && <section><h2 className="mb-4 text-3xl font-semibold">Expert tips</h2><div className="grid gap-4 md:grid-cols-3">{articles.map((a) => <Link key={a.id} to={`/blog/${a.id}`} className="rounded-2xl border bg-card p-5 hover:shadow-md"><p className="text-xs uppercase tracking-widest text-gold">{a.category}</p><p className="text-xl font-semibold">{a.title}</p><p className="mt-1 text-sm text-muted-foreground">{a.excerpt}</p></Link>)}</div></section>}
        <section><div className="mb-4 flex items-end justify-between"><h2 className="text-3xl font-semibold">Courses ({courses.length})</h2><Link to={`/academy?cat=${encodeURIComponent(t.cats[0])}`} className="text-sm text-primary">See in Academy →</Link></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{courses.slice(0, 12).map((c) => <CourseCard key={c.id} c={c} />)}</div></section>
      </div>
      <VideoDialog video={play} onClose={() => setPlay(null)} />
    </>
  );
}
