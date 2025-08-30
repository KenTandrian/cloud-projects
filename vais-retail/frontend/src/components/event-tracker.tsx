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
  useEffect(() => {
    trpc.trackEvent.mutate(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
