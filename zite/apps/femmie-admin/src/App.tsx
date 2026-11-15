import { useState } from 'react';
import { Heart, LayoutDashboard, Users, CreditCard, BookOpen, Gift, ShieldAlert, LifeBuoy, ScrollText, Menu } from 'lucide-react';
import { Toaster } from '@project/components/ui/sonner';
import { Button } from '@project/components/ui/button';
import { cn } from '@project/components/lib/utils';
import Overview from './pages/Overview';
import Members from './pages/Members';
import Billing from './pages/Billing';
import Content from './pages/Content';
import Rewards from './pages/Rewards';
import Moderation from './pages/Moderation';
import Support from './pages/Support';
import Audit from './pages/Audit';

const NAV = [
  ['overview', 'Overview', LayoutDashboard, Overview], ['members', 'Members & roles', Users, Members], ['billing', 'Billing', CreditCard, Billing],
  ['content', 'Content', BookOpen, Content], ['rewards', 'Rewards & referrals', Gift, Rewards], ['moderation', 'Moderation', ShieldAlert, Moderation],
  ['support', 'Support', LifeBuoy, Support], ['audit', 'Audit & integrations', ScrollText, Audit],
] as const;

export default function App() {
  const [tab, setTab] = useState<string>('overview');
  const [open, setOpen] = useState(false);
  const cur = NAV.find((n) => n[0] === tab)!;
  const Page = cur[3];
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className={cn('fixed inset-y-0 left-0 z-30 w-60 border-r bg-card p-4 transition-transform md:static md:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="mb-6 flex items-center gap-2 px-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground"><Heart className="h-4 w-4 fill-current" /></span><div className="leading-none"><p className="font-display text-lg font-bold">FEMMIE Admin</p><p className="text-[10px] uppercase tracking-widest text-gold">Love Femmie Global</p></div></div>
        <nav className="space-y-1">{NAV.map(([k, l, Icon]) => (
          <button key={k} onClick={() => { setTab(k); setOpen(false); }} className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition', tab === k ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><Icon className="h-4 w-4" />{l}</button>))}
        </nav>
        <p className="mt-6 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">Preview data. Payments are simulated; no live provider connected.</p>
      </aside>
      {open && <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center gap-3"><Button size="icon" variant="ghost" className="md:hidden" onClick={() => setOpen(true)}><Menu /></Button><h1 className="text-4xl font-semibold">{cur[1]}</h1></div>
        <Page />
      </main>
      <Toaster />
    </div>
  );
}
