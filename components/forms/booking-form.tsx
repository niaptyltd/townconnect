"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { bookingSchema } from "@/lib/schemas";
import { buildBookingFromLead, buildWhatsAppUrl } from "@/services/lead-service";
import { saveBooking } from "@/services/booking-service";
import type { Business, Service } from "@/types";
import { createId } from "@/utils/slug";

type BookingFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestedDate: string;
  requestedTime: string;
  notes?: string;
};

export function BookingForm({
  business,
  service
}: {
  business: Business;
  service: Service;
}) {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [error, setError] = useState("");
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: user?.fullName ?? "",
      customerEmail: user?.email ?? "",
      customerPhone: user?.whatsappNumber ?? user?.phone ?? "",
      requestedDate: "",
      requestedTime: "",
      notes: ""
    }
  });

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-heading text-2xl font-semibold text-brand-ink">Book a service</h3>
        <p className="mt-2 text-sm text-slate-600">
          Send the request, then continue the booking handoff in WhatsApp if the business prefers it.
        </p>
      </div>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError("");
          const nextWhatsAppUrl = buildWhatsAppUrl({
            business,
            intent: "booking",
            customerName: values.customerName,
            service,
            notes: `${values.requestedDate} at ${values.requestedTime}. ${values.notes ?? ""}`.trim()
          });
          const nextBooking = buildBookingFromLead(
            {
              id: createId("booking"),
              businessId: business.id,
              serviceId: service.id,
              customerId: user?.id ?? "",
              ...values,
              customerEmail: values.customerEmail || user?.email || "",
              customerPhone: values.customerPhone || user?.phone || "",
              customerWhatsappNumber:
                values.customerPhone || user?.whatsappNumber || user?.phone || "",
              notes: values.notes ?? "",
              status: "pending",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              whatsappThreadUrl: nextWhatsAppUrl
            },
            business,
            business.allowInstantWhatsAppLead ? "whatsapp" : "form",
            business.sponsoredStatus === "active" ? "sponsored" : "organic"
          );
          try {
            await saveBooking(nextBooking);
            setWhatsAppUrl(nextWhatsAppUrl);
            setSubmitted(true);
            form.reset({
              customerName: user?.fullName ?? "",
              customerEmail: user?.email ?? "",
              customerPhone: user?.whatsappNumber ?? user?.phone ?? "",
              requestedDate: "",
              requestedTime: "",
              notes: ""
            });
          } catch (submissionError) {
            setError(
              submissionError instanceof Error ? submissionError.message : "Unable to request booking."
            );
          }
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.register("customerName")} placeholder="Your name" />
          <Input
            {...form.register("customerEmail")}
            placeholder="Email address (optional)"
            type="email"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.register("customerPhone")} placeholder="Phone / WhatsApp number" />
          <Input {...form.register("requestedDate")} type="date" />
        </div>
        <Input {...form.register("requestedTime")} type="time" />
        <Textarea {...form.register("notes")} placeholder="Anything the business should know?" />
        {submitted ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Your booking request has been saved in TownConnect.
          </p>
        ) : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit">
            {business.allowInstantWhatsAppLead ? "Save and continue in WhatsApp" : "Request booking"}
          </Button>
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
            href={
              whatsAppUrl ||
              buildWhatsAppUrl({
                business,
                intent: "booking",
                customerName: form.watch("customerName"),
                service,
                notes: `${form.watch("requestedDate")} ${form.watch("requestedTime")} ${form.watch("notes") ?? ""}`.trim()
              })
            }
            rel="noreferrer"
            target="_blank"
          >
            Book on WhatsApp
          </a>
        </div>
      </form>
    </Card>
  );
}
