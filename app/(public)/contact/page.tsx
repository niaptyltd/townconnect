import { ContactForm } from "@/components/forms/contact-form";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("Contact");

export default function ContactPage() {
  return (
    <section className="section-space">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contact"
            title="Talk to the TownConnect team"
            description="Use the form to ask about onboarding, partnerships, advertising or support."
          />

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Support email</p>
              <p className="mt-2 text-lg font-semibold text-brand-ink">hello@townconnect.co.za</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">WhatsApp</p>
              <p className="mt-2 text-lg font-semibold text-brand-ink">+27 83 123 4567</p>
            </div>
          </Card>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
