import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { selectPlan, startCheckout, confirmCheckout, StartCheckoutOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { cn } from '@project/components/lib/utils';
import { PLANS, useData } from '../lib/data';
import StripeCheckout from './StripeCheckout';

type Plan = (typeof PLANS)[number];

export default function PlanCards() {
  const { user } = useAuth();
  const { me, refreshMe } = useData();
  const nav = useNavigate();
  const [pick, setPick] = useState<Plan | null>(null);
  const [session, setSession] = useState<StartCheckoutOutputType | null>(null);
  const [busy, setBusy] = useState(false);
  const current = me?.profile.plan;

  const close = () => { setPick(null); setSession(null); };

  const choose = async (p: Plan) => {
    if (!user) return loginWithRedirect({ redirectUrl: '/membership' });
    setPick(p);
    if (!p.price) return;
    setBusy(true);
    try { setSession(await startCheckout({ plan: p.name as 'Essential' | 'Plus' | 'Elite' })); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not start checkout'); close(); }
    finally { setBusy(false); }
  };

  const onPaid = async () => {
    if (!session || !pick) return;
    await confirmCheckout({ subscriptionId: session.subscriptionId });
    await refreshMe();
    toast.success(`Welcome to ${pick.name}!`);
    close(); nav('/academy');
  };

  const downgrade = async () => {
    setBusy(true);
    try { await selectPlan({ plan: 'Discover' }); await refreshMe(); toast.success('You are now on Discover'); close(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not change plan'); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.name} className={cn('relative flex flex-col rounded-3xl border bg-card p-6 shadow-sm', 'popular' in p && 'border-primary ring-2 ring-primary/20 shadow-lg')}>
            {'popular' in p && <Badge className="absolute -top-3 left-6">Most loved</Badge>}
            <h3 className="text-3xl font-semibold">{p.name}</h3>
            <p className="text-sm text-muted-foreground">{p.tagline}</p>
            <p className="mt-4"><span className="font-display text-5xl font-bold">{p.price ? `$${p.price}` : 'Free'}</span>{p.price > 0 && <span className="text-muted-foreground">/month</span>}</p>
            {p.price > 0 && <p className="text-xs text-botanical font-medium">14-day free trial for new members</p>}
            <ul className="mt-5 flex-1 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}</ul>
            <Button className="mt-6 rounded-full" variant={current === p.name ? 'outline' : 'default'} disabled={current === p.name || busy} onClick={() => choose(p)}>{current === p.name ? 'Current plan' : p.price ? (me?.profile.trialEndsAt ? `Subscribe to ${p.name}` : 'Start free trial') : 'Choose Discover'}</Button>
          </div>
        ))}
      </div>
      <Dialog open={!!pick} onOpenChange={(o) => !o && !busy && close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">{pick?.price ? `Join ${pick.name}` : 'Switch to Discover'}</DialogTitle>
            <DialogDescription>{pick?.price ? <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" />Secure payment by Stripe</span> : 'Your paid subscription will be canceled and you keep free access.'}</DialogDescription>
          </DialogHeader>
          {pick && pick.price > 0 && (
            <>
              <div className="rounded-xl bg-muted p-4 text-sm space-y-1">
                {session?.trial ? <><p>Today: <b>$0.00</b> (14-day free trial)</p><p>Then ${pick.price}/month. Cancel anytime before the trial ends.</p></> : <p>Today: <b>${pick.price}</b>, then ${pick.price}/month. Cancel anytime.</p>}
              </div>
              {session ? <StripeCheckout clientSecret={session.clientSecret} mode={session.mode} label={session.trial ? 'Start free trial' : `Pay $${pick.price}`} onPaid={onPaid} onCancel={close} />
                : <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
            </>
          )}
          {pick && !pick.price && <DialogFooter><Button variant="outline" onClick={close}>Keep my plan</Button><Button onClick={downgrade} disabled={busy}>{busy ? 'Updating…' : 'Switch to Discover'}</Button></DialogFooter>}
        </DialogContent>
      </Dialog>
    </>
  );
}
