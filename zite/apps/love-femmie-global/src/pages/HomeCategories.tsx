import { Link } from 'react-router-dom';

const Card = ({ to, title, sub, children }: { to: string; title: string; sub: string; children: React.ReactNode }) => (
  <Link to={to} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div className="aspect-[4/3] overflow-hidden">{children}</div>
    <div className="p-4"><h3 className="text-2xl font-semibold">{title}</h3><p className="text-sm text-muted-foreground">{sub}</p></div>
  </Link>
);
const img = 'h-full w-full object-cover transition duration-500 group-hover:scale-105';

export default function HomeCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Discover your world</p>
      <h2 className="mb-6 text-4xl font-semibold md:text-5xl">Featured learning</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card to="/recipes" title="World Recipes" sub="Meals from every continent"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/nwMnetPk4JmwNi5ULvDejC/img_ufz0KyJbJ3kmXOVO.jpg" alt="" className={img} /></Card>
        <Card to="/explore/beauty" title="Beauty & Skincare" sub="Glow and self-care lessons"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/sX9HgY2gZPTPuJChWL7wrZ/img_5jq2TzDfxsT1cEIq.jpg" alt="" className={img} /></Card>
        <Card to="/explore/family" title="Family & Parenting" sub="Connect, learn and grow"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/wRipY12oN1jRU8mx2J1FYF/img_0SaTakuYpjihAPMd.jpg" alt="" className={img} /></Card>
        <Card to="/explore/wellness" title="Mind & Wellness" sub="Confidence and healthy routines"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/sxTqSZxisBSHEJBd1ikbZV/img_14-Tl5cxYBJnlvZ6.jpg" alt="" className={img} /></Card>
        <Card to="/explore/home" title="Home & Cleaning" sub="Organize your everyday life"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/wLpFwruDmCmKgfGXVf7RoT/img_gcXI6qvSbQLkrcy0.jpg" alt="" className={img} /></Card>
        <Card to="/explore/pets" title="Pets & Companionship" sub="Care, bonding and training"><img src="https://images.fillout.com/925440/qjsuad7brz/generated-images/uv24DKNZxDDRDXRV2RRiCq/img_h1Fy19PTevyBUITb.jpg" alt="" className={img} /></Card>
      </div>
    </section>
  );
}
