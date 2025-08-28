"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useVisitorIdContext } from "@/components/layout/visitor-id-provider";
import { ProductCard } from "@/components/product-card";
import { RecommendationHeader } from "@/components/reco-header";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { protoJsonToJs } from "@/lib/proto";
import type { IPredictResponse, IRecommendationResult } from "@/lib/types";

interface RecommendationResponse {
  results: IRecommendationResult[];
  attributionToken?: string;
}

const initialRecsData = {
  results: [],
  attributionToken: "",
};

export default function Dashboard() {
  const { visitorId: selectedVisitorId } = useVisitorIdContext();
  const [rfyRecs, setRfyRecs] =
    useState<RecommendationResponse>(initialRecsData);
  const [recentlyViewedRecs, setRecentlyViewedRecs] =
    useState<RecommendationResponse>(initialRecsData);
  const [buyItAgainRecs, setBuyItAgainRecs] =
    useState<RecommendationResponse>(initialRecsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRecommendations = async () => {
      if (!selectedVisitorId) return;

      setLoading(true);
      try {
        // Fetch both sets of recommendations in parallel for efficiency
        const [rfyResponse, recentlyViewedResponse, buyItAgainResponse] =
          await Promise.all([
            fetch(
              `/api/recommendations?modelType=rec_for_you&visitorId=${selectedVisitorId}&pageSize=10`
            ),
            fetch(
              `/api/recommendations?modelType=recently_viewed&visitorId=${selectedVisitorId}&pageSize=10`
            ),
            fetch(
              `/api/recommendations?modelType=buy_it_again&visitorId=${selectedVisitorId}&pageSize=10`
            ),
          ]);

        const rfyData: IPredictResponse = await rfyResponse.json();
        const recentlyViewedData: IPredictResponse =
          await recentlyViewedResponse.json();
        const buyItAgainData: IPredictResponse =
          await buyItAgainResponse.json();

        setRfyRecs({
          attributionToken: rfyData.attributionToken ?? undefined,
          results: rfyData.results || [],
        });
        setRecentlyViewedRecs({
          attributionToken: recentlyViewedData.attributionToken ?? undefined,
          results: recentlyViewedData.results || [],
        });
        setBuyItAgainRecs({
          attributionToken: buyItAgainData.attributionToken ?? undefined,
          results: buyItAgainData.results || [],
        });
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRfyRecs(initialRecsData);
        setRecentlyViewedRecs(initialRecsData);
        setBuyItAgainRecs(initialRecsData);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecommendations();
  }, [selectedVisitorId]);

  return (
    <main className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          Personalized Dashboard
        </h1>
      </div>

      <section className="my-12">
        <h2 className="text-2xl font-semibold mb-2">Recommended For You</h2>
        <RecommendationHeader visitorId={selectedVisitorId} />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 20 }).map((x, i) => (
              <Skeleton className="h-42 w-full" key={i} />
            ))
          ) : rfyRecs.results.length > 0 ? (
            rfyRecs.results.map((rec) => (
              <Link
                href={`/product/${rec.id}?attributionToken=${rfyRecs.attributionToken}`}
                key={rec.id}
              >
                <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
              </Link>
            ))
          ) : (
            <p>No recommendations found for this profile.</p>
          )}
        </div>
      </section>

      <Separator />
      <section className="my-12">
        <h2 className="text-2xl font-semibold mb-2">Recently Viewed</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A simple recap of your recent activity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 20 }).map((x, i) => (
              <Skeleton className="h-42 w-full" key={i} />
            ))
          ) : recentlyViewedRecs.results.length > 0 ? (
            recentlyViewedRecs.results.map((rec) => (
              <Link
                href={`/product/${rec.id}?attributionToken=${recentlyViewedRecs.attributionToken}`}
                key={rec.id}
              >
                <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
              </Link>
            ))
          ) : (
            <p>No recent activity found.</p>
          )}
        </div>
      </section>

      <Separator />
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-2">Buy It Again!</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Encourage recurring investments based on the client&apos;s purchase
          history.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 20 }).map((x, i) => (
              <Skeleton className="h-42 w-full" key={i} />
            ))
          ) : buyItAgainRecs.results.length > 0 ? (
            buyItAgainRecs.results.map((rec) => (
              <Link
                href={`/product/${rec.id}?attributionToken=${buyItAgainRecs.attributionToken}`}
                key={rec.id}
              >
                <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
              </Link>
            ))
          ) : (
            <p>No purchase history found for this profile.</p>
          )}
        </div>
      </section>
    </main>
  );
}
