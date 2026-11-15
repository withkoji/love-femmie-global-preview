import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Award, Gift, Wallet } from 'lucide-react';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { useData } from '../lib/data';
import ProfileForm from '../components/ProfileForm';
import RoutinePlanner from '../components/RoutinePlanner';
import CourseCard from '../components/CourseCard';
import ReferralsPanel from '../components/ReferralsPanel';
import SupportPanel from '../components/SupportPanel';
import BillingButton from '../components/BillingButton';

const ALL_BADGES = ['First Lesson', 'Course Graduate', 'Community Voice'];

export default function Account() {
  const { user, isLoading } = useAuth();
  const { me, catalog } = useData();
  useEffect(() => { if (!isLoading && !user) loginWithRedirect(); }, [isLoading, user]);
  if (!me) return <div className="mx-auto max-w-6xl space-y-4 px-4 py-12"><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-64" /></div>;
  const { profile } = me;
  const courses = catalog?.courses ?? [];
  const learning = courses.filter((c) => me.enrollments.some((e) => e.courseId === c.id));
  const saved = (catalog?.recipes ?? []).filter((r) => profile.savedRecipes.includes(r.id));
  const watch = (catalog?.videos ?? []).filter((v) => profile.watchlist.includes(v.id));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-accent to-secondary p-8 md:flex-row md:items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-3xl text-primary-foreground">{profile.displayName[0]?.toUpperCase()}</div>
        <div className="flex-1"><h1 className="text-4xl font-semibold">Hello, {profile.displayName}</h1>
          <p className="text-sm text-muted-foreground">{profile.plan} member{me.subscription && ` · ${me.subscription.status}`}{me.subscription?.renewalDate && ` · renews ${format(new Date(me.subscription.renewalDate), 'MMM d, yyyy')}`}{profile.kidsMode && ' · Kids Mode on'}</p></div>
        <div className="flex gap-3"><div className="rounded-2xl bg-background px-5 py-3 text-center"><p className="font-display text-3xl font-bold text-primary">{me.points}</p><p className="text-xs text-muted-foreground">points</p></div>
          <Button asChild variant="outline" className="self-center rounded-full"><Link to="/membership">Manage plan</Link></Button>{profile.plan !== 'Discover' && <BillingButton />}</div>
      </div>
      <Tabs defaultValue="learning" className="mt-8">
        <TabsList className="h-auto flex-wrap">{[['learning', 'My learning'], ['saved', 'Saved'], ['rewards', 'Rewards'], ['referrals', 'Referrals'], ['routine', 'Daily planner'], ['support', 'Support'], ['profile', 'Profile']].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}</TabsList>
        <TabsContent value="learning" className="pt-4">
          {learning.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{learning.map((c) => <CourseCard key={c.id} c={c} />)}</div>
            : <div className="rounded-2xl border p-10 text-center"><p className="text-muted-foreground">You haven’t started a course yet.</p><Button asChild className="mt-3 rounded-full"><Link to="/academy">Browse the Academy</Link></Button></div>}
          {me.certificates.length > 0 && <div className="mt-6"><h3 className="mb-2 text-2xl font-semibold">Certificates</h3><div className="flex flex-wrap gap-3">{me.certificates.map((c) => <div key={c.id} className="flex items-center gap-2 rounded-xl border border-gold/40 bg-secondary px-4 py-3 text-sm"><Award className="h-5 w-5 text-gold" />{courses.find((x) => x.id === c.courseId)?.title}<span className="text-xs text-muted-foreground">{c.issueDate && format(new Date(c.issueDate), 'MMM d, yyyy')}</span></div>)}</div></div>}
        </TabsContent>
        <TabsContent value="saved" className="grid gap-6 pt-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5"><p className="mb-2 font-semibold">Saved recipes</p>{saved.length ? saved.map((r) => <p key={r.id} className="border-b py-2 text-sm last:border-0">{r.title} <span className="text-muted-foreground">· {r.country}</span></p>) : <p className="text-sm text-muted-foreground">Save recipes from <Link to="/recipes" className="text-primary">World Recipes</Link>.</p>}</div>
          <div className="rounded-2xl border bg-card p-5"><p className="mb-2 font-semibold">Watchlist</p>{watch.length ? watch.map((v) => <p key={v.id} className="border-b py-2 text-sm last:border-0">{v.title} <span className="text-muted-foreground">· {v.collection}</span></p>) : <p className="text-sm text-muted-foreground">Add shows from <Link to="/tv" className="text-primary">FEMMIE TV</Link>.</p>}</div>
        </TabsContent>
        <TabsContent value="rewards" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5"><Wallet className="h-5 w-5 text-primary" /><p className="mt-2 font-display text-4xl font-bold">{me.points}</p><p className="text-sm text-muted-foreground">Approved points · {me.pendingPoints} pending review</p></div>
            <div className="rounded-2xl border bg-card p-5 md:col-span-2"><Gift className="h-5 w-5 text-gold" /><p className="mt-2 font-semibold">Redemptions & cashback</p><p className="text-sm text-muted-foreground">Redemption requests and cashback are disabled in this preview until funding, legal and redemption rules are in place. Points are demonstration only.</p></div>
          </div>
          <div className="flex flex-wrap gap-2">{ALL_BADGES.map((b) => { const ok = me.badges.includes(b); return <Badge key={b} variant={ok ? 'default' : 'outline'} className={ok ? '' : 'opacity-50'}>{ok ? '★ ' : ''}{b}</Badge>; })}</div>
          <div className="rounded-2xl border bg-card"><p className="border-b p-4 font-semibold">Points history</p>
            {me.ledger.length ? me.ledger.map((l) => <div key={l.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0"><div><p>{l.reason}</p><p className="text-xs text-muted-foreground">{l.createdAt && format(new Date(l.createdAt), 'MMM d, yyyy · h:mm a')} · {l.status}</p></div><span className="font-semibold text-primary">+{l.points}</span></div>)
              : <p className="p-4 text-sm text-muted-foreground">Complete a lesson quiz to earn your first points.</p>}</div>
        </TabsContent>
        <TabsContent value="referrals" className="pt-4"><ReferralsPanel /></TabsContent>
        <TabsContent value="routine" className="pt-4"><RoutinePlanner /></TabsContent>
        <TabsContent value="support" className="pt-4"><SupportPanel /></TabsContent>
        <TabsContent value="profile" className="pt-4"><ProfileForm /></TabsContent>
      </Tabs>
    </div>
  );
}
