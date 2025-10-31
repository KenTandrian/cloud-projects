"use client";

import { useEffect } from "react";

import { trpc } from "@/lib/trpc/client";

interface EventTrackerProps {
  attributionToken: string;
  eventType: "detail-page-view"; // Can be expanded for other events
  visitorId: string;
  productId: string;
}

export function EventTracker(props: EventTrackerProps) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on mount
  useEffect(() => {
    trpc.trackEvent.mutate(props);
  }, []);

  return null;
}
