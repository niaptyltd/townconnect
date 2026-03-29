import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { getFirebaseAdminDb } from "@/firebase/admin";
import { assertAdminBackendConfigured, isFirebaseAdminConfigured } from "@/firebase/config";
import type { CollectionKey } from "@/lib/firestore/collections";
import { seedCollections } from "@/lib/seed-data";

type DemoStore = typeof seedCollections;
type StoredDocument = { id: string };

const demoStorePath = path.join(process.cwd(), ".demo-server-store.json");

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function ensureDemoStoreFile() {
  try {
    await readFile(demoStorePath, "utf8");
  } catch {
    await mkdir(path.dirname(demoStorePath), { recursive: true });
    await writeFile(demoStorePath, JSON.stringify(seedCollections, null, 2), "utf8");
  }
}

async function readDemoStore(): Promise<DemoStore> {
  await ensureDemoStoreFile();

  try {
    const raw = await readFile(demoStorePath, "utf8");
    return JSON.parse(raw) as DemoStore;
  } catch {
    const reset = clone(seedCollections);
    await writeFile(demoStorePath, JSON.stringify(reset, null, 2), "utf8");
    return reset;
  }
}

async function writeDemoStore(store: DemoStore) {
  await writeFile(demoStorePath, JSON.stringify(store, null, 2), "utf8");
}

export async function listServerDocuments<T>(collectionName: CollectionKey) {
  if (isFirebaseAdminConfigured) {
    const snapshot = await getFirebaseAdminDb().collection(collectionName).get();
    return snapshot.docs.map((item) => item.data() as T);
  }

  assertAdminBackendConfigured("Server-side admin data access");

  const store = await readDemoStore();
  return clone(store[collectionName]) as T[];
}

export async function getServerDocumentById<T extends StoredDocument>(
  collectionName: CollectionKey,
  id: string
) {
  if (!id) return null;

  if (isFirebaseAdminConfigured) {
    const snapshot = await getFirebaseAdminDb().collection(collectionName).doc(id).get();
    return snapshot.exists ? (snapshot.data() as T) : null;
  }

  assertAdminBackendConfigured("Server-side admin data access");

  const store = await readDemoStore();
  const document =
    (store[collectionName] as StoredDocument[]).find((item) => item.id === id) ?? null;
  return clone(document) as T | null;
}

export async function saveServerDocument<T extends StoredDocument>(
  collectionName: CollectionKey,
  document: T
) {
  if (isFirebaseAdminConfigured) {
    await getFirebaseAdminDb().collection(collectionName).doc(document.id).set(document);
    return document;
  }

  assertAdminBackendConfigured("Server-side admin data writes");

  const store = await readDemoStore();
  const items = store[collectionName] as StoredDocument[];
  const index = items.findIndex((item) => item.id === document.id);

  if (index === -1) {
    items.unshift(clone(document));
  } else {
    items[index] = clone(document);
  }

  await writeDemoStore(store);
  return document;
}

export async function deleteServerDocument(collectionName: CollectionKey, id: string) {
  if (isFirebaseAdminConfigured) {
    await getFirebaseAdminDb().collection(collectionName).doc(id).delete();
    return;
  }

  assertAdminBackendConfigured("Server-side admin data deletes");

  const store = await readDemoStore();
  (store as Record<CollectionKey, StoredDocument[]>)[collectionName] = (
    store[collectionName] as StoredDocument[]
  ).filter((item) => item.id !== id);
  await writeDemoStore(store);
}
