import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Flag, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { getCommunity, communityAction, type GetCommunityOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Textarea } from '@project/components/ui/textarea';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { useData } from '../lib/data';

const TOPICS = ['General', 'Recipes', 'Skincare', 'Parenting', 'Wellness', 'Home', 'Pet Care', 'Daily Routines', 'Achievements'];

export default function Community() {
  const { user } = useAuth();
  const { me, refreshMe } = useData();
  const [posts, setPosts] = useState<GetCommunityOutputType['posts'] | null>(null);
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('General');
  const [busy, setBusy] = useState(false);
  const load = () => getCommunity({}).then((r) => setPosts(r.posts)).catch(() => setPosts([]));
  useEffect(() => { load(); }, []);
  const post = async () => {
    if (text.trim().length < 3) return toast.error('Write a little more before posting');
    setBusy(true);
    try { await communityAction({ action: 'create', content: text, topic }); setText(''); toast.success('Posted!'); load(); refreshMe(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not post'); } finally { setBusy(false); }
  };
  const act = async (postId: string, action: 'like' | 'report') => {
    if (!user) return loginWithRedirect();
    if (action === 'like') setPosts((p) => p?.map((x) => (x.id === postId ? { ...x, likes: x.likes + 1 } : x)) ?? null);
    else setPosts((p) => p?.filter((x) => x.id !== postId) ?? null);
    try { await communityAction({ action, postId }); if (action === 'report') toast.success('Thanks — our moderators will review it.'); } catch { toast.error('Something went wrong'); load(); }
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Community</p>
      <h1 className="text-5xl font-semibold">Share the love</h1>
      <p className="mt-2 text-muted-foreground">Share recipes, wins and tips. Be kind — posts can be reported and are moderated.</p>
      {user && !me?.profile.kidsMode ? (
        <div className="mt-6 space-y-3 rounded-2xl border bg-card p-5">
          <Textarea value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="What did you learn, cook or achieve today?" />
          <div className="flex gap-2"><Select value={topic} onValueChange={setTopic}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>{TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            <Button onClick={post} disabled={busy} className="ml-auto rounded-full">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Post</Button></div>
        </div>
      ) : !user ? <Button className="mt-6 rounded-full" onClick={() => loginWithRedirect()}>Log in to post</Button>
        : <p className="mt-6 rounded-xl bg-muted p-4 text-sm">Posting is turned off while Kids Mode is on.</p>}
      <div className="mt-8 space-y-4">
        {!posts ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />) : posts.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-lg text-accent-foreground">{p.authorName[0]}</div>
              <div className="flex-1"><p className="font-semibold">{p.authorName}</p><p className="text-xs text-muted-foreground">{p.createdAt && formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</p></div><Badge variant="secondary">{p.topic}</Badge></div>
            <p className="mt-3">{p.content}</p>
            <div className="mt-3 flex gap-2"><Button variant="ghost" size="sm" onClick={() => act(p.id, 'like')}><Heart className="mr-1 h-4 w-4 text-primary" />{p.likes}</Button><Button variant="ghost" size="sm" onClick={() => act(p.id, 'report')}><Flag className="mr-1 h-4 w-4" />Report</Button></div>
          </div>))}
      </div>
    </div>
  );
}
