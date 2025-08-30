"use client";

import { useVisitorIdContext } from "@/components/layout/visitor-id-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PROFILE_EXPLANATIONS } from "@/config/visitor";
import { Terminal } from "lucide-react";

export function RecommendationHeader() {
  const { visitorId } = useVisitorIdContext();
  const persona = visitorId?.split("-")[1] ?? "general";
  const explanation =
    PROFILE_EXPLANATIONS[persona] ?? PROFILE_EXPLANATIONS.general;

  return (
    <Alert className="mb-8">
      <Terminal className="h-4 w-4" />
      <AlertTitle>{explanation.title}</AlertTitle>
      <AlertDescription>{explanation.description}</AlertDescription>
    </Alert>
  );
}
