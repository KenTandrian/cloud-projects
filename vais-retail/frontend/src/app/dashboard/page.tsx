"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { RecommendationHeader } from "@/components/reco-header";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitorIdContext } from "@/components/visitor-id-provider";
import { protoJsonToJs } from "@/lib/proto";
import { IRecommendationResult } from "@/lib/types";

export default function Dashboard() {
  const { visitorId: selectedVisitorId } = useVisitorIdContext();
  const [rfyRecs, setRfyRecs] = useState<IRecommendationResult[]>([]);
  const [recentlyViewedRecs, setRecentlyViewedRecs] = useState<
    IRecommendationResult[]
  >([]);
  const [buyItAgainRecs, setBuyItAgainRecs] = useState<IRecommendationResult[]>(
    []
  );
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

        const rfyData = await rfyResponse.json();
        const recentlyViewedData = await recentlyViewedResponse.json();
        const buyItAgainData = await buyItAgainResponse.json();

        setRfyRecs(rfyData.results || []);
        setRecentlyViewedRecs(recentlyViewedData.results || []);
        setBuyItAgainRecs(buyItAgainData.results || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRfyRecs([]);
        setRecentlyViewedRecs([]);
        setBuyItAgainRecs([]);
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
          ) : rfyRecs.length > 0 ? (
            rfyRecs.map((rec) => (
              <Link href={`/product/${rec.id}`} key={rec.id}>
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
          ) : recentlyViewedRecs.length > 0 ? (
            recentlyViewedRecs.map((rec) => (
              <Link href={`/product/${rec.id}`} key={rec.id}>
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
          ) : buyItAgainRecs.length > 0 ? (
            buyItAgainRecs.map((rec) => (
              <Link href={`/product/${rec.id}`} key={rec.id}>
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
