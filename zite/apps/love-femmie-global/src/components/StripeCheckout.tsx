import { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@project/components/ui/button';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = pk ? loadStripe(pk) : null;

function useAppearance() {
  return useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const v = (n: string, f: string) => { const x = root.getPropertyValue(n).trim(); return x ? `hsl(${x})` : f; };
    return {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: v('--primary', '#b5476b'),
        colorBackground: v('--background', '#ffffff'),
        colorText: v('--foreground', '#222222'),
        colorDanger: v('--destructive', '#dc2626'),
        fontFamily: 'Manrope, system-ui, sans-serif',
        borderRadius: '12px',
      },
    };
  }, []);
}

function Form({ mode, label, onPaid, onCancel }: { mode: 'payment' | 'setup'; label: string; onPaid: () => Promise<void>; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true); setError(undefined);
    const opts = { elements, redirect: 'if_required' as const, confirmParams: { return_url: `${window.location.origin}/membership` } };
    const { error } = mode === 'setup' ? await stripe.confirmSetup(opts) : await stripe.confirmPayment(opts);
    if (error) { setError(error.message); setBusy(false); return; }
    try { await onPaid(); } catch (err) { setError(err instanceof Error ? err.message : 'Could not activate plan'); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" disabled={!stripe || busy}>{busy ? 'Processing…' : label}</Button>
      </div>
    </form>
  );
}

export default function StripeCheckout(props: { clientSecret: string; mode: 'payment' | 'setup'; label: string; onPaid: () => Promise<void>; onCancel: () => void }) {
  const appearance = useAppearance();
  if (!stripePromise) return <p className="text-sm text-muted-foreground">Connecting to Stripe…</p>;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret, appearance }}>
      <Form {...props} />
    </Elements>
  );
}
