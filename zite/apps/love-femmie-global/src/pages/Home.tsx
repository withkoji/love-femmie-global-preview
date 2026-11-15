import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Clock, Gift, Play, Sun, Moon, Droplets, Sparkles } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { useData, type Recipe, type Video } from '../lib/data';
import CourseCard from '../components/CourseCard';
import PlanCards from '../components/PlanCards';
import VideoDialog from '../components/VideoDialog';
import RecipeDialog from '../components/RecipeDialog';
import { Newsletter } from '../components/Footer';
import Categories from './HomeCategories';

const Section = ({ eyebrow, title, link, children }: { eyebrow: string; title: string; link?: [string, string]; children: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-4 py-14">
    <div className="mb-6 flex items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p><h2 className="text-4xl font-semibold md:text-5xl">{title}</h2></div>
      {link && <Link to={link[0]} className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">{link[1]}<ArrowRight className="h-4 w-4" /></Link>}
    </div>
    {children}
  </section>
);

export default function Home() {
  const { catalog } = useData();
  const [video, setVideo] = useState<Video | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const today = catalog?.recipes.find((r) => r.featuredToday) ?? catalog?.recipes[0];
  return (
    <>
      <section className="relative min-h-[560px] h-[78vh] w-full overflow-hidden">
        <img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/cnvieaZcRjaBzJWfha7ns9/img_pTbu6L-yYyvKtfHW.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">Global Lifestyle & Academy</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-3 max-w-2xl text-5xl font-semibold leading-[1.05] text-white md:text-7xl">A World of Learning, Love & Everyday Living</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 max-w-lg text-lg text-white/90">Discover beautiful recipes, wellness rituals, family inspiration, and skills for life.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild className="rounded-full"><Link to="/academy">Explore Now</Link></Button>
            <Button size="lg" variant="outline" asChild className="rounded-full border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/membership">Membership</Link></Button>
          </motion.div>
          <p className="mt-10 text-sm tracking-[0.3em] text-white/80">LEARN • NOURISH • LOVE • GROW • EARN</p>
        </div>
      </section>

      <Categories />

      {today && (
        <Section eyebrow="Today’s Recipe" title={today.title} link={['/recipes', 'All recipes']}>
          <div className="grid overflow-hidden rounded-3xl border bg-card shadow-md md:grid-cols-2">
            <img src={today.image} alt="" className="h-full min-h-[260px] w-full object-cover" />
            <div className="p-8">
              <p className="text-sm text-muted-foreground">{today.country} · {today.mealType}</p>
              <p className="mt-3">{today.description}</p>
              <div className="mt-4 flex gap-4 text-sm"><span className="flex gap-1"><Clock className="h-4 w-4 text-primary" />{today.prepMinutes + today.cookMinutes} min total</span><span>Serves {today.servings}</span></div>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">{today.ingredients.split('\n').slice(0, 4).map((i) => <li key={i}>{i}</li>)}</ul>
              <p className="mt-4 rounded-xl bg-muted p-3 text-sm">{today.nutritionNotes}</p>
              <Button className="mt-6 rounded-full" onClick={() => setRecipe(today)}>View full recipe</Button>
            </div>
          </div>
        </Section>
      )}

      <Section eyebrow="FEMMIE Academy" title="Trending courses" link={['/academy', 'Browse all']}>
        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4">
          {!catalog ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-80 w-72 shrink-0 rounded-2xl" />)
            : catalog.courses.filter((c) => c.trending).map((c) => <div key={c.id} className="w-72 shrink-0 snap-start"><CourseCard c={c} /></div>)}
        </div>
      </Section>

      <section className="bg-foreground py-14 text-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Featured on</p><h2 className="text-4xl font-semibold md:text-5xl">FEMMIE TV</h2></div><Link to="/tv" className="text-sm text-gold">Open FEMMIE TV →</Link></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {catalog?.videos.filter((v) => v.featured).map((v) => (
              <button key={v.id} onClick={() => setVideo(v)} className="group text-left">
                <div className="relative aspect-video overflow-hidden rounded-xl"><img src={v.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /><span className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition group-hover:opacity-100"><Play className="h-10 w-10 fill-white text-white" /></span></div>
                <p className="mt-2 font-medium">{v.title}</p><p className="text-xs opacity-60">{v.collection} · {v.durationMinutes} min</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Beauty & Wellness" title="Rituals for your glow">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="overflow-hidden rounded-2xl border bg-card md:col-span-2"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/sX9HgY2gZPTPuJChWL7wrZ/img_5jq2TzDfxsT1cEIq.jpg" alt="" className="aspect-[16/8] w-full object-cover" /><div className="p-6"><p className="text-xs uppercase tracking-widest text-gold">Skincare</p><h3 className="text-3xl font-semibold">The five-minute morning glow routine</h3><p className="mt-2 text-muted-foreground">Cleanse, hydrate, protect — a gentle, inclusive routine for every skin tone.</p></div></article>
          <article className="overflow-hidden rounded-2xl border bg-card"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/sxTqSZxisBSHEJBd1ikbZV/img_14-Tl5cxYBJnlvZ6.jpg" alt="" className="aspect-[4/3] w-full object-cover" /><div className="p-6"><p className="text-xs uppercase tracking-widest text-botanical">Mind</p><h3 className="text-2xl font-semibold">Journaling for a calmer week</h3><p className="mt-2 text-sm text-muted-foreground">Three prompts to reset your confidence.</p></div></article>
        </div>
      </Section>

      <Section eyebrow="Family Corner" title="Grow together">
        <div className="grid items-center gap-8 rounded-3xl bg-accent p-6 md:grid-cols-2 md:p-10">
          <img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/wRipY12oN1jRU8mx2J1FYF/img_0SaTakuYpjihAPMd.jpg" alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div className="space-y-4">
            {[['Painting Sunday', 'A mess-friendly art hour for ages 3–8'], ['Kitchen science', 'Make rainbow rice and learn about color'], ['Bedtime stories on FEMMIE TV', 'Calm, captioned stories for little ones']].map(([t, d]) => <div key={t} className="rounded-xl bg-background p-4 shadow-sm"><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>)}
            <p className="text-xs text-muted-foreground">Children’s activities are designed for use with a parent or guardian.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Daily Routine" title="Plan a gentle day" link={['/account', 'Open my planner']}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[Sun, '6:30', 'Wake & stretch'], [Droplets, '10:00', 'Hydration check'], [Sparkles, '18:30', 'Family dinner'], [Moon, '21:30', 'Skincare & wind down']].map(([Icon, t, l]) => { const I = Icon as typeof Sun; return <div key={l as string} className="rounded-2xl border bg-card p-5"><I className="h-5 w-5 text-gold" /><p className="mt-3 font-display text-3xl font-semibold">{t as string}</p><p className="text-sm text-muted-foreground">{l as string}</p></div>; })}
        </div>
      </Section>

      <Section eyebrow="FEMMIE Rewards" title="Learn and earn">
        <div className="grid gap-5 md:grid-cols-3">
          {[[Award, '+10 points', 'for every lesson quiz you pass'], [Gift, '+50 bonus', 'when you complete a full course'], [Sparkles, 'Badges', 'celebrate milestones and share achievements']].map(([Icon, t, d]) => { const I = Icon as typeof Award; return <div key={t as string} className="rounded-2xl border bg-gradient-to-br from-secondary to-card p-6"><I className="h-6 w-6 text-primary" /><p className="mt-3 font-display text-3xl font-semibold">{t as string}</p><p className="text-sm text-muted-foreground">{d as string}</p></div>; })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Demonstration rewards. Points have no cash value; cashback is disabled.</p>
      </Section>

      <Section eyebrow="Membership" title="Choose your plan"><PlanCards /></Section>

      <Section eyebrow="Journal" title="Lifestyle inspiration" link={["/blog", "Read the journal"]}>
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border bg-card overflow-hidden"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/wLpFwruDmCmKgfGXVf7RoT/img_gcXI6qvSbQLkrcy0.jpg" alt="" className="aspect-[4/3] w-full object-cover" /><div className="p-5"><p className="text-xs uppercase tracking-widest text-gold">Home</p><h3 className="text-2xl font-semibold">A pantry that makes weeknights easy</h3></div></article>
          <article className="rounded-2xl border bg-card overflow-hidden"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/uv24DKNZxDDRDXRV2RRiCq/img_h1Fy19PTevyBUITb.jpg" alt="" className="aspect-[4/3] w-full object-cover" /><div className="p-5"><p className="text-xs uppercase tracking-widest text-gold">Pets</p><h3 className="text-2xl font-semibold">Bonding rituals with your dog</h3></div></article>
          <article className="rounded-2xl border bg-card overflow-hidden"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/nwMnetPk4JmwNi5ULvDejC/img_ufz0KyJbJ3kmXOVO.jpg" alt="" className="aspect-[4/3] w-full object-cover" /><div className="p-5"><p className="text-xs uppercase tracking-widest text-gold">Food</p><h3 className="text-2xl font-semibold">Six continents, one dinner table</h3></div></article>
        </div>
      </Section>

      <Newsletter />
      <VideoDialog video={video} onClose={() => setVideo(null)} />
      <RecipeDialog recipe={recipe} onClose={() => setRecipe(null)} />
    </>
  );
}
