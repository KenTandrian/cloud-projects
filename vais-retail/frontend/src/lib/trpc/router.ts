import { z } from "zod";

import { completeQuery } from "@/lib/retail/completion";
import { getRecommendations } from "@/lib/retail/prediction";
import { search } from "@/lib/retail/search";
import { writeUserEvent } from "@/lib/retail/user-event";
import { publicProcedure, router } from "@/lib/trpc/server";
import { eventTypesSchema } from "@/types/recommendation";

export const appRouter = router({
  autocomplete: publicProcedure
    .input(
      z.object({
        query: z.string(),
        visitorId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { query, visitorId } = input;
      const results = await completeQuery(query, visitorId);
      return results;
    }),
  recommendation: publicProcedure
    .input(
      z.object({
        modelType: eventTypesSchema,
        pageSize: z.number().optional(),
        productId: z.string().optional(),
        visitorId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { modelType, pageSize, productId, visitorId } = input;
      const results = await getRecommendations(
        modelType,
        productId ?? "",
        visitorId,
        { pageSize }
      );
      return results;
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        visitorId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { query, visitorId } = input;
      const results = await search(query, visitorId);
      return results;
    }),
  trackEvent: publicProcedure
    .input(
      z.object({
        attributionToken: z.string().optional(),
        eventType: z.string(),
        productId: z.string(),
        visitorId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { attributionToken, eventType, visitorId, productId } = input;
      return writeUserEvent({
        attributionToken,
        eventType,
        visitorId,
        productDetails: [{ product: { id: productId } }],
      });
    }),
});

export type AppRouter = typeof appRouter;
