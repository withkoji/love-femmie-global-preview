import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Lock, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { getCourse, completeLesson, type GetCourseOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Progress } from '@project/components/ui/progress';
import { Skeleton } from '@project/components/ui/skeleton';
import { cn } from '@project/components/lib/utils';
import { canAccess, useData } from '../lib/data';

export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { me, refreshMe } = useData();
  const [data, setData] = useState<GetCourseOutputType | null>(null);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getCourse({ courseId: id! }).then(setData).catch(() => toast.error('Course not found')); }, [id]);

  if (!data) return <div className="mx-auto max-w-5xl space-y-4 px-4 py-12"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-40" /></div>;
  const { course, lessons } = data;
  const lesson = lessons[idx];
  const done = me?.enrollments.find((e) => e.courseId === course.id)?.completedLessonIds ?? [];
  const allowed = !!user && canAccess(me?.profile.plan, course.requiredPlan);
  const pct = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;

  const submit = async () => {
    if (answer === null) return;
    setBusy(true);
    try {
      const r = await completeLesson({ lessonId: lesson.id, answerIndex: answer });
      if (!r.correct) toast.error('Not quite — review the lesson and try again.');
      else {
        toast.success(r.pointsAwarded ? `Correct! +${r.pointsAwarded} reward points` : 'Correct! (already completed)');
        if (r.courseCompleted) toast.success('🎓 Course complete — certificate unlocked!');
        await refreshMe(); setAnswer(null); if (idx < lessons.length - 1) setIdx(idx + 1);
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Something went wrong'); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/academy" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Academy</Link>
      <div className="grid overflow-hidden rounded-3xl border bg-card md:grid-cols-[1.2fr_1fr]">
        <img src={course.coverImage} alt="" className="h-full max-h-80 w-full object-cover" />
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2"><Badge variant="secondary">{course.category}</Badge><Badge variant="outline">{course.difficulty}</Badge><Badge variant="outline">{course.requiredPlan}+</Badge></div>
          <h1 className="mt-3 text-4xl font-semibold">{course.title}</h1>
          <p className="text-sm text-muted-foreground">with {course.instructor} · {course.durationMinutes} min · ★ {course.rating.toFixed(1)}</p>
          <p className="mt-3 text-sm">{course.description}</p>
          <ul className="mt-3 space-y-1 text-sm">{course.objectives.split('\n').filter(Boolean).map((o) => <li key={o} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-botanical" />{o}</li>)}</ul>
          {user && <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span>Your progress</span><span>{pct}%</span></div><Progress value={pct} /></div>}
          {pct === 100 && <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary p-3 text-sm font-medium"><Award className="h-5 w-5 text-gold" />Certificate of completion earned</div>}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="space-y-1">{lessons.map((l, i) => (
          <button key={l.id} onClick={() => { setIdx(i); setAnswer(null); }} className={cn('flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition', i === idx ? 'bg-accent font-semibold text-accent-foreground' : 'hover:bg-muted')}>
            {done.includes(l.id) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-botanical" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}{l.order}. {l.title}
          </button>))}
        </aside>
        {!allowed ? (
          <div className="grid place-items-center rounded-3xl border bg-muted/50 p-10 text-center">
            <div><Lock className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-3 text-3xl font-semibold">{user ? `Unlock with ${course.requiredPlan}` : 'Sign in to start learning'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{user ? 'Upgrade your membership to access these lessons, quizzes and certificate.' : 'Create a free account to track progress and earn rewards.'}</p>
              {user ? <Button asChild className="mt-4 rounded-full"><Link to="/membership">View plans</Link></Button> : <Button className="mt-4 rounded-full" onClick={() => loginWithRedirect()}>Log in / Sign up</Button>}</div>
          </div>
        ) : lesson && (
          <article className="rounded-3xl border bg-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-widest text-gold">Lesson {lesson.order} of {lessons.length}</p>
            <h2 className="text-3xl font-semibold">{lesson.title}</h2>
            {lesson.videoUrl && <video src={lesson.videoUrl} controls className="mt-4 aspect-video w-full rounded-xl bg-black" />}
            <p className="mt-4 leading-relaxed">{lesson.content}</p>
            <div className="mt-6 rounded-2xl bg-secondary/60 p-5">
              <p className="font-semibold">Quick check: {lesson.quizQuestion}</p>
              <div className="mt-3 space-y-2">{lesson.quizOptions.map((o, i) => (
                <button key={o} onClick={() => setAnswer(i)} className={cn('block w-full rounded-xl border bg-background px-4 py-2.5 text-left text-sm transition', answer === i ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40')}>{o}</button>))}
              </div>
              <Button className="mt-4 rounded-full" disabled={answer === null || busy} onClick={submit}>{busy ? 'Checking…' : done.includes(lesson.id) ? 'Check answer again' : 'Submit & complete lesson'}</Button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
