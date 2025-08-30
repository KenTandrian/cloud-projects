import { z } from "zod";

import { getRecommendations } from "@/lib/recommendations";
import { search } from "@/lib/search";
import { publicProcedure, router } from "@/lib/trpc/server";
import { eventTypesSchema } from "@/types/recommendations";

export const appRouter = router({
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
});

export type AppRouter = typeof appRouter;
