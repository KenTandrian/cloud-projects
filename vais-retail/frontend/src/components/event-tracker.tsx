"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { trpc } from "@/lib/trpc/client";

interface EventTrackerProps {
  eventType: "detail-page-view"; // Can be expanded for other events
  visitorId: string;
  productId: string;
}

export function EventTracker(props: EventTrackerProps) {
  const searchParams = useSearchParams();
  const attributionToken = searchParams.get("attributionToken");

  useEffect(() => {
    trpc.trackEvent.mutate({
      ...props,
      attributionToken: attributionToken || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
