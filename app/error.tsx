"use client";

import { useEffect } from "react";

import { PageState } from "@/components/ui/page-state";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4 py-10">
      <PageState
        title="Something went wrong"
        description="TownConnect hit an unexpected error while loading this page. Try again, or go back to the homepage if the problem continues."
        tone="error"
      />
      <div className="container-shell flex justify-center">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-line px-5 text-sm font-semibold text-brand-ink"
          onClick={() => reset()}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
