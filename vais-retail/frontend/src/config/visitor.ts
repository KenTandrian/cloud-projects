import type { ProfileExplanation } from "@/types/visitor";

/**
 * Visitor profiles are used to simulate different types of users.
 * The user IDs may need to be changed based on the available user data.
 */
export const VISITOR_PROFILES = [
  { id: "investor-value-15", label: "Conservative (Value) Investor 1" },
  { id: "investor-value-126", label: "Conservative (Value) Investor 2" },
  { id: "investor-tech-72", label: "Tech Focused Investor 1" },
  { id: "investor-tech-160", label: "Tech Focused Investor 2" },
  { id: "investor-hedger-236", label: "Strategic Hedger 1" },
  { id: "investor-hedger-154", label: "Strategic Hedger 2" },
  { id: "investor-dca-59", label: "Dollar-Cost Averager (ETF) 1" },
  { id: "investor-dca-220", label: "Dollar-Cost Averager (ETF) 2" },
];

/**
 * Map visitor IDs to specific explanations for the demo narrative
 */
export const PROFILE_EXPLANATIONS: Record<string, ProfileExplanation> = {
  general: {
    title: "General Profile",
    description:
      "Displaying personalized recommendations based on this client's activity.",
  },
  dca: {
    title: "Profile: Dollar-Cost Averager",
    description:
      "This client practices dollar-cost averaging by making regular, recurring investments into core holdings like broad-market ETFs. The 'Frequent Investments' panel highlights these assets to encourage consistency.",
  },
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
