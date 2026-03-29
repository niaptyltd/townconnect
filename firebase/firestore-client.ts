import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore";

import { firebaseDb } from "@/firebase/client";

export async function listDocuments<T>(collectionName: string) {
  if (!firebaseDb) {
    throw new Error("Firestore has not been configured.");
  }

  const snapshot = await getDocs(collection(firebaseDb, collectionName));
  return snapshot.docs.map((item: any) => item.data() as T);
}

export async function listDocumentsByField<T>(
  collectionName: string,
  fieldName: string,
  value: string | boolean | number
) {
  if (!firebaseDb) {
    throw new Error("Firestore has not been configured.");
  }

  const collectionRef = collection(firebaseDb, collectionName);
  const snapshot = await getDocs(query(collectionRef, where(fieldName, "==", value)));
  return snapshot.docs.map((item: any) => item.data() as T);
}

export async function listDocumentsByFieldValues<T>(
  collectionName: string,
  fieldName: string,
  values: string[]
) {
  if (!firebaseDb) {
    throw new Error("Firestore has not been configured.");
  }

  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  if (uniqueValues.length === 0) return [];

  const collectionRef = collection(firebaseDb, collectionName);
  const chunks: string[][] = [];
  for (let index = 0; index < uniqueValues.length; index += 10) {
    chunks.push(uniqueValues.slice(index, index + 10));
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) => getDocs(query(collectionRef, where(fieldName, "in", chunk))))
  );

  const items = snapshots.flatMap((snapshot) => snapshot.docs.map((item: any) => item.data() as T));
  const map = new Map<string, T>();

  items.forEach((item: any) => {
    map.set(item.id, item as T);
  });

  return Array.from(map.values());
}

export async function upsertDocument<T extends { id: string }>(collectionName: string, document: T) {
  if (!firebaseDb) {
    throw new Error("Firestore has not been configured.");
  }

  await setDoc(doc(firebaseDb, collectionName, document.id), document);
}

export async function removeDocument(collectionName: string, id: string) {
  if (!firebaseDb) {
    throw new Error("Firestore has not been configured.");
  }

  await deleteDoc(doc(firebaseDb, collectionName, id));
}
