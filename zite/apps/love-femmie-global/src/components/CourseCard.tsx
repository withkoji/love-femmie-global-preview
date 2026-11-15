import { Link } from 'react-router-dom';
import { Clock, Lock, Star } from 'lucide-react';
import { Badge } from '@project/components/ui/badge';
import { canAccess, useData, type Course } from '../lib/data';

export default function CourseCard({ c }: { c: Course }) {
  const { me } = useData();
  const locked = !canAccess(me?.profile.plan, c.requiredPlan);
  const enr = me?.enrollments.find((e) => e.courseId === c.id);
  const pct = enr && c.lessonCount ? Math.round((enr.completedLessonIds.length / c.lessonCount) * 100) : 0;
  return (
    <Link to={`/academy/${c.id}`} className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={c.coverImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background">{c.category}</Badge>
        {locked && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-1 text-xs text-background"><Lock className="h-3 w-3" />{c.requiredPlan}</span>}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold leading-tight">{c.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{c.instructor}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-gold" />{c.rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.durationMinutes} min</span>
          <span>{c.difficulty}</span>
        </div>
        {enr && <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>}
      </div>
    </Link>
  );
}
