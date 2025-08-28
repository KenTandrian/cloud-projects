"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface EventTrackerProps {
  eventType: "detail-page-view"; // Can be expanded for other events
  visitorId: string;
  productId: string;
}

export function EventTracker(props: EventTrackerProps) {
  const searchParams = useSearchParams();
  const attributionToken = searchParams.get("attributionToken");

  useEffect(() => {
    async function trackEvent() {
      try {
        fetch("/api/track-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...props,
            attributionToken: attributionToken || undefined,
          }),
          keepalive: true,
        });
      } catch (error) {
        console.error("Failed to track event:", error);
      }
    }

    trackEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
