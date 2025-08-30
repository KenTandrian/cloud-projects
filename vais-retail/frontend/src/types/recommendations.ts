import { z } from "zod";

export const eventTypesSchema = z.enum([
  "buy_it_again",
  "frequently_bought_together",
  "others_you_may_like",
  "recommended_for_you",
  "recently_viewed",
  "similar_items",
]);

export type EventType = z.infer<typeof eventTypesSchema>;

export type ServingConfig = {
  active: boolean;
  eventType: "home-page-view" | "detail-page-view";
  id: string;
};
