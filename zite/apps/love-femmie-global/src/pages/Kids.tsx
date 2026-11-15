import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Palette, ShieldCheck } from 'lucide-react';
import { useData, type Video } from '../lib/data';
import CourseCard from '../components/CourseCard';
import VideoDialog from '../components/VideoDialog';

export default function Kids() {
  const { catalog, me } = useData();
  const [play, setPlay] = useState<Video | null>(null);
  const videos = (catalog?.videos ?? []).filter((v) => v.ageRating === 'Kids' || v.collection === 'Bedtime Stories');
  const courses = (catalog?.courses ?? []).filter((c) => c.category === "Children's Activities");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="rounded-3xl bg-gradient-to-br from-secondary via-accent to-card p-8 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Kids Corner</p>
        <h1 className="text-5xl font-semibold">Little learners, big hearts</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">Bedtime stories, creative activities and age-appropriate videos — designed to enjoy together with a parent or guardian.</p>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-background/70 p-3 text-sm"><ShieldCheck className="h-5 w-5 text-botanical" />
          {me?.profile.kidsMode ? 'Kids Mode is on for this account.' : <span>Parents: turn on <b>Kids Mode</b> in <Link to="/account" className="text-primary underline">My FEMMIE → Profile</Link> to limit videos and disable posting.</span>}</div>
      </div>
      <h2 className="mt-12 mb-4 flex items-center gap-2 text-3xl font-semibold"><Moon className="h-6 w-6 text-gold" />Bedtime stories & videos</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{videos.map((v) => <button key={v.id} onClick={() => setPlay(v)} className="text-left"><img src={v.thumbnail} alt="" className="aspect-video w-full rounded-2xl object-cover" /><p className="mt-2 font-medium">{v.title}</p><p className="text-xs text-muted-foreground">{v.durationMinutes} min · {v.ageRating}</p></button>)}</div>
      <h2 className="mt-12 mb-4 flex items-center gap-2 text-3xl font-semibold"><Palette className="h-6 w-6 text-primary" />Activities to do together</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{courses.slice(0, 12).map((c) => <CourseCard key={c.id} c={c} />)}</div>
      <VideoDialog video={play} onClose={() => setPlay(null)} />
    </div>
  );
}
