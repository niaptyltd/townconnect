"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminCollection<T>(loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextItems = await loader();
      setItems(nextItems);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    setItems,
    loading,
    error,
    refresh
  };
}
