import { Copy, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { useData } from '../lib/data';

export default function ReferralsPanel() {
  const { me } = useData();
  if (!me) return null;
  const link = `${window.location.origin}/?ref=${me.profile.referralCode}`;
  const copy = async () => { await navigator.clipboard.writeText(link); toast.success('Referral link copied'); };
  const share = () => navigator.share ? navigator.share({ title: 'Join me on LOVE FEMMIE', url: link }).catch(() => {}) : copy();
  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border bg-card p-6">
        <p className="font-semibold">Your referral link</p>
        <p className="text-sm text-muted-foreground">When a new member joins with your link, you earn 100 points after our team verifies the referral.</p>
        <div className="mt-3 flex gap-2"><Input readOnly value={link} /><Button size="icon" variant="outline" onClick={copy}><Copy className="h-4 w-4" /></Button><Button size="icon" onClick={share}><Share2 className="h-4 w-4" /></Button></div>
      </div>
      <div className="rounded-2xl border bg-card"><p className="border-b p-4 font-semibold">Referral history ({me.referrals.length})</p>
        {me.referrals.length ? me.referrals.map((r) => <div key={r.id} className="flex justify-between border-b px-4 py-3 text-sm last:border-0"><span>New member · {r.createdAt && format(new Date(r.createdAt), 'MMM d, yyyy')}</span><span className="font-medium">{r.status}</span></div>)
          : <p className="p-4 text-sm text-muted-foreground">No referrals yet.</p>}</div>
      <p className="text-xs text-muted-foreground">Self-referrals, duplicate accounts and artificial clicks are not rewarded.</p>
    </div>
  );
}
