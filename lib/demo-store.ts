"use client";

import { assertDemoModeEnabled } from "@/firebase/config";
import { seedCollections } from "@/lib/seed-data";

const STORAGE_PREFIX = "townconnect:demo:";

export type DemoCollectionKey = keyof typeof seedCollections;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readDemoCollection<T>(key: DemoCollectionKey): T[] {
  assertDemoModeEnabled("Demo data access");
  const fallback = seedCollections[key] as T[];

  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!raw) {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

export function writeDemoCollection<T>(key: DemoCollectionKey, items: T[]) {
  assertDemoModeEnabled("Demo data writes");
  if (!canUseStorage()) return;
  window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(items));
}

export function upsertDemoDocument<T extends { id: string }>(key: DemoCollectionKey, document: T) {
  const items = readDemoCollection<T>(key);
  const index = items.findIndex((item) => item.id === document.id);
  const next = [...items];

  if (index === -1) {
    next.unshift(document);
  } else {
    next[index] = document;
  }

  writeDemoCollection(key, next);
}

export function removeDemoDocument(key: DemoCollectionKey, id: string) {
  const items = readDemoCollection<{ id: string }>(key);
  writeDemoCollection(
    key,
    items.filter((item) => item.id !== id)
  );
}
