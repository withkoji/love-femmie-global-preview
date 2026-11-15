import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeNewsletter } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try { await subscribeNewsletter({ email }); toast.success('You’re on the list — welcome to LOVE FEMMIE!'); setEmail(''); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not subscribe'); }
    finally { setBusy(false); }
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground md:px-16">
        <Heart className="mx-auto mb-3 h-6 w-6 fill-current" />
        <h2 className="text-4xl font-semibold">Love letters, weekly</h2>
        <p className="mx-auto mt-2 max-w-md opacity-90">A new recipe, a wellness ritual and a family idea in your inbox every Sunday.</p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bg-background text-foreground rounded-full" />
          <Button type="submit" disabled={busy} className="rounded-full bg-foreground text-background hover:bg-foreground/90">{busy ? 'Joining…' : 'Subscribe'}</Button>
        </form>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold">LOVE FEMMIE</p>
          <p className="mt-1 text-sm tracking-widest text-gold">Learn • Nourish • Love • Grow • Earn</p>
          <div className="mt-4 flex gap-3 text-muted-foreground"><Instagram className="h-5 w-5" /><Facebook className="h-5 w-5" /><Youtube className="h-5 w-5" /></div>
        </div>
        <div className="space-y-2 text-sm"><p className="font-semibold">Explore</p><Link to="/academy" className="block text-muted-foreground hover:text-foreground">Academy</Link><Link to="/recipes" className="block text-muted-foreground hover:text-foreground">World Recipes</Link><Link to="/tv" className="block text-muted-foreground hover:text-foreground">FEMMIE TV</Link></div>
        <div className="space-y-2 text-sm"><p className="font-semibold">Membership</p><Link to="/membership" className="block text-muted-foreground hover:text-foreground">Plans & pricing</Link><Link to="/account" className="block text-muted-foreground hover:text-foreground">Rewards wallet</Link><p className="text-muted-foreground">Support: hello@lovefemmie.com</p></div>
        <div className="space-y-2 text-sm text-muted-foreground"><p className="font-semibold text-foreground">Policies & accessibility</p><p>Wellness content is educational and not medical advice. Children’s participation requires parental consent. Captions are provided on FEMMIE TV.</p></div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© 2026 LOVE FEMMIE Global · Preview — not a production payment or education platform</p>
    </footer>
  );
}
