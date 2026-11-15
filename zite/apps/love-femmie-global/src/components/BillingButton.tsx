import { useState } from 'react';
import { toast } from 'sonner';
import { billingPortal } from 'zitejs/api';
import { Button } from '@project/components/ui/button';

export default function BillingButton() {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    try {
      const { url } = await billingPortal({ returnPath: '/account' });
      if (window.top !== window.self) window.open(url, '_blank'); else window.location.href = url;
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not open billing'); }
    finally { setBusy(false); }
  };
  return <Button variant="outline" className="self-center rounded-full" onClick={open} disabled={busy}>{busy ? 'Opening…' : 'Billing & invoices'}</Button>;
}
