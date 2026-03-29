"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types";

export function ProductForm({
  initialValue,
  onSave,
  submitLabel = "Save product",
  disabled = false
}: {
  initialValue: Product;
  onSave: (product: Product) => Promise<void>;
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
      updatedAt: new Date().toISOString()
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="grid gap-4">
      <Input disabled={disabled} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Product title" value={form.title} />
      <Textarea
        disabled={disabled}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        placeholder="Describe the product"
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
        <Select disabled={disabled} onChange={(event) => setForm({ ...form, stockStatus: event.target.value as Product["stockStatus"] })} value={form.stockStatus}>
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </Select>
      </div>
      <Input
        disabled={disabled}
        onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
        placeholder="Image URL"
        value={form.imageUrl}
      />
      {saved ? <p className="text-sm text-emerald-700">Product saved.</p> : null}
      <Button disabled={disabled} onClick={() => void submit()}>{submitLabel}</Button>
    </div>
  );
}
