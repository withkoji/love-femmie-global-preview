import { useState } from 'react';
import { Bookmark, BookmarkCheck, Lock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { toggleSaved } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { canAccess, useData, type Video } from '../lib/data';
import VideoDialog from '../components/VideoDialog';

function Tile({ v, onPlay }: { v: Video; onPlay: () => void }) {
  const { user } = useAuth();
  const { me, refreshMe } = useData();
  const inList = !!me?.profile.watchlist.includes(v.id);
  const locked = !canAccess(me?.profile.plan, v.requiredPlan);
  const toggle = async () => {
    if (!user) return loginWithRedirect();
    try { const r = await toggleSaved({ kind: 'watchlist', itemId: v.id }); toast.success(r.saved ? 'Added to watchlist' : 'Removed from watchlist'); refreshMe(); } catch { toast.error('Could not update watchlist'); }
  };
  return (
    <div className="w-64 shrink-0">
      <button onClick={onPlay} className="group relative block aspect-video w-full overflow-hidden rounded-xl">
        <img src={v.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition group-hover:opacity-100">{locked ? <Lock className="h-8 w-8 text-white" /> : <Play className="h-10 w-10 fill-white text-white" />}</span>
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 text-[10px] text-white">{v.ageRating}</span>
      </button>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div><p className="text-sm font-medium leading-tight">{v.title}</p><p className="text-xs text-white/50">{v.durationMinutes} min · {v.requiredPlan}</p></div>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/10 hover:text-white" onClick={toggle}>{inList ? <BookmarkCheck className="h-4 w-4 text-gold" /> : <Bookmark className="h-4 w-4" />}</Button>
      </div>
    </div>
  );
}

export default function TV() {
  const { catalog, me } = useData();
  const [play, setPlay] = useState<Video | null>(null);
  const videos = (catalog?.videos ?? []).filter((v) => !me?.profile.kidsMode || ['Kids', 'All Ages'].includes(v.ageRating));
  const hero = videos.find((v) => v.featured);
  const continueIds = (me?.watchHistory ?? []).filter((w) => w.position > 1).map((w) => videos.find((v) => v.id === w.videoId)).filter((v): v is Video => !!v);
  const rows: [string, Video[]][] = [
    ['Continue watching', continueIds],
    ['My watchlist', videos.filter((v) => me?.profile.watchlist.includes(v.id))],
    ...[...new Set(videos.map((v) => v.collection))].map((c) => [c, videos.filter((v) => v.collection === c)] as [string, Video[]]),
  ];
  return (
    <div className="min-h-screen bg-foreground pb-16 text-background">
      {hero ? (
        <section className="relative h-[60vh] min-h-[420px]">
          <img src={hero.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">FEMMIE TV Original</p>
            <h1 className="text-5xl font-semibold text-white md:text-6xl">{hero.title}</h1>
            <p className="mt-2 max-w-lg text-white/80">{hero.description}</p>
            <Button className="mt-5 w-fit rounded-full" onClick={() => setPlay(hero)}><Play className="mr-2 h-4 w-4 fill-current" />Play</Button>
          </div>
        </section>
      ) : <Skeleton className="h-[60vh] rounded-none" />}
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-6">
        {rows.filter(([, l]) => l.length).map(([title, list]) => (
          <section key={title}><h2 className="mb-3 text-2xl font-semibold text-white">{title}</h2>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">{list.map((v) => <Tile key={v.id} v={v} onPlay={() => setPlay(v)} />)}</div></section>
        ))}
        <p className="text-xs text-white/40">Demonstration media. Production requires licensed content and a secure video host.</p>
      </div>
      <VideoDialog video={play} onClose={() => setPlay(null)} />
    </div>
  );
}
