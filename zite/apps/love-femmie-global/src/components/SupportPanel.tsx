import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createTicket } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Badge } from '@project/components/ui/badge';
import { useData } from '../lib/data';

export default function SupportPanel() {
  const { me, refreshMe } = useData();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) return setErr('Add a subject (at least 3 characters)');
    if (message.trim().length < 10) return setErr('Describe the issue (at least 10 characters)');
    setErr(''); setBusy(true);
    try { await createTicket({ subject, message }); toast.success('Ticket sent — we’ll reply by email'); setSubject(''); setMessage(''); refreshMe(); }
    catch { toast.error('Could not send ticket'); } finally { setBusy(false); }
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-6">
        <p className="font-semibold">Contact support</p>
        <div className="space-y-1.5"><Label>Subject</Label><Input value={subject} maxLength={120} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Message</Label><Textarea rows={5} value={message} maxLength={3000} onChange={(e) => setMessage(e.target.value)} /></div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" disabled={busy} className="rounded-full">{busy ? 'Sending…' : 'Send ticket'}</Button>
      </form>
      <div className="rounded-2xl border bg-card"><p className="border-b p-4 font-semibold">My tickets</p>
        {me?.tickets.length ? me.tickets.map((t) => <div key={t.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0"><div><p>{t.subject}</p><p className="text-xs text-muted-foreground">{t.createdAt && format(new Date(t.createdAt), 'MMM d, yyyy')}</p></div><Badge variant="outline">{t.status}</Badge></div>)
          : <p className="p-4 text-sm text-muted-foreground">No tickets yet.</p>}</div>
    </div>
  );
}
