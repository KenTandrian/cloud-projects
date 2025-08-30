"use client";

import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { protoJsonToJs } from "@/lib/proto";
import { trpc } from "@/lib/trpc/react-query";
import type { EventType } from "@/types/recommendation";

interface ProductPanelProps {
  description?: string;
  header?: React.ReactNode;
  modelType: EventType;
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
  const { data: recs, isLoading } = trpc.recommendation.useQuery({
    modelType,
    visitorId,
    pageSize: 10,
  });

  return (
    <section className="my-12">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {header}
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton className="h-42 w-full" key={i} />
          ))}
        </div>
      ) : recs?.results && recs.results.length > 0 ? (
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
