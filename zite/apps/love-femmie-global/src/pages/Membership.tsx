import PlanCards from '../components/PlanCards';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@project/components/ui/accordion';

const FAQ = [
  ['How does the 14-day trial work?', 'Eligible new members on paid plans pay nothing for 14 days. You can cancel any time before the trial ends.'],
  ['Can I change plans later?', 'Yes — upgrade or downgrade any time from this page.'],
  ['Is my payment secure?', 'Yes. Payments are processed by Stripe — LOVE FEMMIE never sees or stores your card details. Manage invoices, cards and cancellation from your Account page.'],
  ['Are children allowed?', 'Children’s activities are designed for use under a parent or guardian’s account and consent.'],
];

export default function Membership() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Membership</p>
        <h1 className="text-5xl font-semibold md:text-6xl">Learn • Nourish • Love • Grow • Earn</h1>
        <p className="mt-3 text-muted-foreground">Transparent pricing in USD. Cancel anytime.</p>
      </div>
      <PlanCards />
      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="mb-4 text-3xl font-semibold">Questions</h2>
        <Accordion type="single" collapsible>{FAQ.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion>
      </div>
    </div>
  );
}
