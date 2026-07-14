"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export function SearchAnalytics({ query, resultCount }: { query: string; resultCount: number }) {
  const trackedQuery = useRef("");

  useEffect(() => {
    if (!query || trackedQuery.current === query) {
      return;
    }
    trackedQuery.current = query;
    trackEvent("library_search", {
      query: query.slice(0, 80),
      result_count: resultCount,
      has_results: resultCount > 0,
    });
  }, [query, resultCount]);

  return null;
}
