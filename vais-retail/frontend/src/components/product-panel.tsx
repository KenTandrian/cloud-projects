"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { protoJsonToJs } from "@/lib/proto";
import type { IPredictResponse, IRecommendationResult } from "@/lib/types";

interface RecommendationResponse {
  attributionToken?: string;
  results: IRecommendationResult[];
}

const initialRecsData = {
  attributionToken: "",
  results: [],
};

interface ProductPanelProps {
  description?: string;
  header?: React.ReactNode;
  modelType: string;
  title: string;
  visitorId: string;
}

export function ProductPanel({
  description,
  header,
  modelType,
  title,
  visitorId,
}: ProductPanelProps) {
  const [recs, setRecs] = useState<RecommendationResponse>(initialRecsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!visitorId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/recommendations?modelType=${modelType}&visitorId=${visitorId}&pageSize=10`
        );
        const data: IPredictResponse = await response.json();
        setRecs({
          attributionToken: data.attributionToken ?? undefined,
          results: data.results || [],
        });
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRecs(initialRecsData);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [modelType, visitorId]);

  return (
    <section className="my-12">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {header}
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((x, i) => (
            <Skeleton className="h-42 w-full" key={i} />
          ))}
        </div>
      ) : recs.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recs.results.map((rec) => (
            <Link
              href={`/product/${rec.id}?attributionToken=${recs.attributionToken}`}
              key={rec.id}
            >
              <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
            </Link>
          ))}
        </div>
      ) : (
        <p>No recommendations found for this profile.</p>
      )}
    </section>
  );
}
