import { useEffect, useState } from 'react';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';

export type ArticleDraft = { id?: string; title: string; categoryId: string; author: string; excerpt: string; body: string; image: string; status: 'Draft' | 'Published' };

export default function ArticleDialog({ draft, categories, onClose, onSave }: { draft: ArticleDraft | null; categories: { id: string; name: string }[]; onClose: () => void; onSave: (a: ArticleDraft) => Promise<void> }) {
  const [f, setF] = useState<ArticleDraft | null>(draft);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setF(draft); setErr(''); }, [draft]);
  const submit = async () => {
    if (!f) return;
    if (f.title.trim().length < 3) return setErr('Title must be at least 3 characters');
    if (f.image && !/^https?:\/\//.test(f.image)) return setErr('Image must be a full URL');
    setBusy(true); await onSave(f); setBusy(false);
  };
  const set = (k: keyof ArticleDraft, v: string) => f && setF({ ...f, [k]: v });
  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{f?.id ? 'Edit article' : 'New article'}</DialogTitle></DialogHeader>
        {f && <div className="space-y-3">
          <div className="space-y-1.5"><Label>Title</Label><Input value={f.title} maxLength={150} onChange={(e) => set('title', e.target.value)} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Category</Label><Select value={f.categoryId || undefined} onValueChange={(v) => set('categoryId', v)}><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Author</Label><Input value={f.author} maxLength={80} onChange={(e) => set('author', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Status</Label><Select value={f.status} onValueChange={(v) => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Published">Published</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-1.5"><Label>Image URL</Label><Input value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" /></div>
          <div className="space-y-1.5"><Label>Excerpt</Label><Textarea rows={2} maxLength={300} value={f.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Body</Label><Textarea rows={8} value={f.body} onChange={(e) => set('body', e.target.value)} /></div>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save article'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
