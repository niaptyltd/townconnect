import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const testimonials = [
  {
    quote: "Customers found us through TownConnect before we even launched our own website.",
    name: "Nomfundo Dlamini",
    role: "Glow Beauty Studio"
  },
  {
    quote: "It feels local, simple and practical. The WhatsApp flow fits how our clients already communicate.",
    name: "Siyabonga Khumalo",
    role: "Vryheid Grill House"
  },
  {
    quote: "The admin tools make it easy to verify listings and keep the town directory trustworthy.",
    name: "TownConnect Pilot Admin",
    role: "Platform operations"
  }
];

export function TestimonialsSection() {
  return (
    <section className="section-space bg-white/60">
      <div className="container-shell space-y-8">
        <SectionHeading
          eyebrow="Community proof"
          title="Built to create real local momentum"
          description="These are MVP testimonials and can later be replaced with live customer stories and trust metrics."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card className="space-y-5" key={item.name}>
              <p className="text-base leading-7 text-slate-700">“{item.quote}”</p>
              <div>
                <p className="font-semibold text-brand-ink">{item.name}</p>
                <p className="text-sm text-slate-500">{item.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
