"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/types";

export function ServiceForm({
  initialValue,
  onSave,
  submitLabel = "Save service",
  disabled = false
}: {
  initialValue: Service;
  onSave: (service: Service) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
}) {
  const [form, setForm] = useState(initialValue);
  const [saved, setSaved] = useState(false);

  async function submit() {
    if (disabled) return;
    await onSave({
      ...form,
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      updatedAt: new Date().toISOString()
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="grid gap-4">
      <Input disabled={disabled} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Service title" value={form.title} />
      <Textarea
        disabled={disabled}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        placeholder="Describe the service"
        value={form.description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          disabled={disabled}
          min="0"
          onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
          placeholder="Price"
          type="number"
          value={form.price}
        />
        <Input
          disabled={disabled}
          min="15"
          onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}
          placeholder="Duration (minutes)"
          type="number"
          value={form.durationMinutes}
        />
      </div>
      {saved ? <p className="text-sm text-emerald-700">Service saved.</p> : null}
      <Button disabled={disabled} onClick={() => void submit()}>{submitLabel}</Button>
    </div>
  );
}
