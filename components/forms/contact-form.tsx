"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/schemas";

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });

  return (
    <Card>
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit(() => {
          setSubmitted(true);
          form.reset();
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.register("name")} placeholder="Your name" />
          <Input {...form.register("email")} placeholder="Email address" type="email" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input {...form.register("phone")} placeholder="Phone number" />
          <Input {...form.register("subject")} placeholder="Subject" />
        </div>
        <Textarea {...form.register("message")} placeholder="How can we help?" />
        {submitted ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Thanks. Your message has been captured in the MVP flow.
          </p>
        ) : null}
        <Button type="submit">Send message</Button>
      </form>
    </Card>
  );
}
