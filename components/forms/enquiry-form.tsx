"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { enquirySchema } from "@/lib/schemas";
import { buildEnquiryFromLead, buildWhatsAppUrl } from "@/services/lead-service";
import { saveEnquiry } from "@/services/enquiry-service";
import type { Business, RelatedType } from "@/types";
import { createId } from "@/utils/slug";

type EnquiryFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  relatedType: RelatedType;
  relatedId: string;
};

export function EnquiryForm({
  business,
  relatedType = "general",
  relatedId = ""
}: {
  business: Business;
  relatedType?: RelatedType;
  relatedId?: string;
}) {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [error, setError] = useState("");
  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.whatsappNumber ?? user?.phone ?? "",
      subject: "",
      message: "",
      relatedType,
      relatedId
    }
  });

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-brand-ink">Send an enquiry</h3>
        <p className="mt-2 text-sm text-slate-600">
          Save your request in TownConnect, then continue the fastest conversation path on WhatsApp.
        </p>
      </div>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError("");
          const nextWhatsAppUrl = buildWhatsAppUrl({
            business,
            intent: "enquiry",
            customerName: values.name,
            subject: values.subject,
            notes: values.message
          });
          const nextEnquiry = buildEnquiryFromLead(
            {
              id: createId("enquiry"),
              businessId: business.id,
              customerId: user?.id ?? "",
              ...values,
              email: values.email || user?.email || "",
              phone: values.phone || user?.phone || "",
              whatsappNumber: values.phone || user?.whatsappNumber || user?.phone || "",
              status: "new",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              whatsappThreadUrl: nextWhatsAppUrl
            },
            business,
            business.allowInstantWhatsAppLead ? "whatsapp" : "form",
            business.sponsoredStatus === "active" ? "sponsored" : "organic"
          );
          try {
            await saveEnquiry(nextEnquiry);
            setWhatsAppUrl(nextWhatsAppUrl);
            setSubmitted(true);
            form.reset({
              name: user?.fullName ?? "",
              email: user?.email ?? "",
              phone: user?.whatsappNumber ?? user?.phone ?? "",
              subject: "",
              message: "",
              relatedType,
              relatedId
            });
          } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : "Unable to send enquiry.");
          }
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.register("name")} placeholder="Your name" />
          <Input
            {...form.register("email")}
            placeholder="Email address (optional)"
            type="email"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.register("phone")} placeholder="Phone / WhatsApp number" />
          <Input {...form.register("subject")} placeholder="Subject" />
        </div>
        <Textarea {...form.register("message")} placeholder="Tell the business what you need" />
        {submitted ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Your enquiry has been captured in TownConnect.
          </p>
        ) : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {business.allowInstantWhatsAppLead ? (
          <p className="text-sm text-slate-600">
            TownConnect will save your enquiry details, then you can continue the conversation in WhatsApp.
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit">
            {business.allowInstantWhatsAppLead ? "Save and continue in WhatsApp" : "Send enquiry"}
          </Button>
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
            href={
              whatsAppUrl ||
              buildWhatsAppUrl({
                business,
                intent: "enquiry",
                subject: form.watch("subject"),
                customerName: form.watch("name"),
                notes: form.watch("message")
              })
            }
            rel="noreferrer"
            target="_blank"
          >
            Quick WhatsApp
          </a>
        </div>
      </form>
    </Card>
  );
}
