import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { listContent, saveContent, type ListContentOutputType, type SaveContentInputType } from 'zitejs/api';
import { Badge } from '@project/components/ui/badge';
import { Button } from '@project/components/ui/button';
import { Switch } from '@project/components/ui/switch';
import { Skeleton } from '@project/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@project/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import DataTable, { type Col } from '../components/DataTable';
import ConfirmButton from '../components/ConfirmButton';
import ArticleDialog, { type ArticleDraft } from '../components/ArticleDialog';

type D = ListContentOutputType;
type Plan = 'Discover' | 'Essential' | 'Plus' | 'Elite';
const PLANS: Plan[] = ['Discover', 'Essential', 'Plus', 'Elite'];

function Pick({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>;
}

export default function Content() {
  const [d, setD] = useState<D | null>(null);
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const load = () => listContent({}).then(setD);
  useEffect(() => { load(); }, []);
  const save = async (input: SaveContentInputType, msg = 'Saved') => { try { await saveContent(input); toast.success(msg); load(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); } };
  const courseCols = useMemo<Col<D['courses'][0]>[]>(() => [
    { key: 't', label: 'Course', render: (r) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.instructor} · {r.lessons} lessons</p></div>, sort: (r) => r.title },
    { key: 'c', label: 'Category', render: (r) => r.category, sort: (r) => r.category },
    { key: 'd', label: 'Level', render: (r) => r.difficulty },
    { key: 'p', label: 'Plan', render: (r) => <Pick value={r.requiredPlan} options={PLANS} onChange={(v) => save({ kind: 'course', id: r.id, status: r.status as 'Draft' | 'Published', requiredPlan: v as Plan })} /> },
    { key: 's', label: 'Status', render: (r) => <Pick value={r.status} options={['Draft', 'Published']} onChange={(v) => save({ kind: 'course', id: r.id, status: v as 'Draft' | 'Published', requiredPlan: r.requiredPlan as Plan })} /> },
  ], []);
  const articleCols = useMemo<Col<D['articles'][0]>[]>(() => [
    { key: 't', label: 'Article', render: (r) => <p className="font-medium">{r.title}</p>, sort: (r) => r.title },
    { key: 'a', label: 'Author', render: (r) => r.author },
    { key: 's', label: 'Status', render: (r) => <Badge variant={r.status === 'Published' ? 'default' : 'outline'}>{r.status}</Badge> },
    { key: 'x', label: '', render: (r) => <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setDraft({ ...r, status: r.status as 'Draft' | 'Published' })}>Edit</Button><ConfirmButton label="Delete" title="Delete article?" description="This permanently removes the article." onConfirm={() => save({ kind: 'deleteArticle', id: r.id }, 'Deleted')} /></div> },
  ], []);
  const videoCols = useMemo<Col<D['videos'][0]>[]>(() => [
    { key: 't', label: 'Video', render: (r) => <p className="font-medium">{r.title}</p>, sort: (r) => r.title },
    { key: 'c', label: 'Collection', render: (r) => r.collection, sort: (r) => r.collection },
    { key: 'a', label: 'Age', render: (r) => r.ageRating },
    { key: 'p', label: 'Plan', render: (r) => <Pick value={r.requiredPlan} options={PLANS} onChange={(v) => save({ kind: 'video', id: r.id, requiredPlan: v as Plan, featured: r.featured })} /> },
    { key: 'f', label: 'Featured', render: (r) => <Switch checked={r.featured} onCheckedChange={(v) => save({ kind: 'video', id: r.id, requiredPlan: r.requiredPlan as Plan, featured: v })} /> },
  ], []);
  if (!d) return <Skeleton className="h-96 rounded-2xl" />;
  return (
    <>
      <Tabs defaultValue="courses">
        <TabsList><TabsTrigger value="courses">Courses ({d.courses.length})</TabsTrigger><TabsTrigger value="articles">Articles ({d.articles.length})</TabsTrigger><TabsTrigger value="videos">FEMMIE TV ({d.videos.length})</TabsTrigger></TabsList>
        <TabsContent value="courses"><DataTable rows={d.courses} cols={courseCols} search={(r) => `${r.title} ${r.category} ${r.instructor} ${r.requiredPlan} ${r.status}`} /></TabsContent>
        <TabsContent value="articles"><DataTable rows={d.articles} cols={articleCols} search={(r) => `${r.title} ${r.author} ${r.status}`} toolbar={<Button size="sm" onClick={() => setDraft({ title: '', categoryId: '', author: 'LOVE FEMMIE Editorial', excerpt: '', body: '', image: '', status: 'Draft' })}><Plus className="mr-1 h-4 w-4" />New article</Button>} /></TabsContent>
        <TabsContent value="videos"><DataTable rows={d.videos} cols={videoCols} search={(r) => `${r.title} ${r.collection}`} /></TabsContent>
      </Tabs>
      <ArticleDialog draft={draft} categories={d.categories} onClose={() => setDraft(null)} onSave={async (a) => { await save({ kind: 'article', ...a }); setDraft(null); }} />
    </>
  );
}
