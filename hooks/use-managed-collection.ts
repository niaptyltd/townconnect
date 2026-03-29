"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteCollectionDocument,
  getCollection,
  saveCollectionDocument
} from "@/services/data-service";
import type { DemoCollectionKey } from "@/lib/demo-store";

export function useManagedCollection<T extends { id: string }>(collectionName: DemoCollectionKey) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const next = await getCollection<T>(collectionName);
      setItems(next);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (document: T) => {
      setError("");
      try {
        await saveCollectionDocument(collectionName, document);
        await refresh();
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : "Unable to save record.";
        setError(message);
        throw new Error(message);
      }
    },
    [collectionName, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setError("");
      try {
        await deleteCollectionDocument(collectionName, id);
        await refresh();
      } catch (removeError) {
        const message =
          removeError instanceof Error ? removeError.message : "Unable to delete record.";
        setError(message);
        throw new Error(message);
      }
    },
    [collectionName, refresh]
  );

  return {
    items,
    loading,
    error,
    refresh,
    save,
    remove
  };
}
