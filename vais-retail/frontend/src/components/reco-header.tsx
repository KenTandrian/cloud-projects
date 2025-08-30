"use client";

import { useVisitorIdContext } from "@/components/layout/visitor-id-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface ProfileExplanation {
  title: string;
  description: string;
}

// Map visitor IDs to specific explanations for the demo narrative
const EXPLANATIONS: Record<string, ProfileExplanation> = {
  value: {
    title: "Profile: Conservative Value Investor",
    description:
      "Based on this client's history of viewing and purchasing stable, dividend-paying companies, the 'Recommended for You' model is suggesting other blue-chip stocks with strong value metrics.",
  },
  tech: {
    title: "Profile: Tech-Savvy Investor",
    description:
      "This client shows a strong interest in the technology sector and high-growth stocks. The model is recommending other innovative tech companies that align with their profile.",
  },
  hedger: {
    title: "Profile: Strategic Hedger",
    description:
      "This client often pairs high-growth investments with stable assets. The recommendations reflect a blend of innovative tech and established, blue-chip companies.",
  },
};

export function RecommendationHeader() {
  const { visitorId } = useVisitorIdContext();
  const persona = visitorId.split("-")[1];
  const explanation = EXPLANATIONS[persona] || {
    title: "General Profile",
    description:
      "Displaying personalized recommendations based on this client's activity.",
  };

  return (
    <Alert className="mb-8">
      <Terminal className="h-4 w-4" />
      <AlertTitle>{explanation.title}</AlertTitle>
      <AlertDescription>{explanation.description}</AlertDescription>
    </Alert>
  );
}
