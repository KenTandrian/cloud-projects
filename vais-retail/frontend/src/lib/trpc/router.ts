import { z } from "zod";

import { getRecommendations } from "@/lib/recommendations";
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
});

export type AppRouter = typeof appRouter;
