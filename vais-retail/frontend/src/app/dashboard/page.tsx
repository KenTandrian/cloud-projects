"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { RecommendationHeader } from "@/components/reco-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { protoJsonToJs } from "@/lib/proto";
import { IRecommendationResult } from "@/lib/types";

const VISITOR_PROFILES = [
  { id: "visitor-value-1-6", label: "Conservative Value Investor 1" },
  { id: "visitor-value-75-20", label: "Conservative Value Investor 2" },
  { id: "visitor-value-25-6", label: "Conservative Value Investor 3" },
  { id: "visitor-tech-2-5", label: "Tech-Savvy Investor 1" },
  { id: "visitor-tech-59-0", label: "Tech-Savvy Investor 2" },
  { id: "visitor-tech-37-48", label: "Tech-Savvy Investor 3" },
  { id: "visitor-hedger-3-10", label: "Strategic Hedger 1" },
  { id: "visitor-hedger-38-47", label: "Strategic Hedger 2" },
  { id: "visitor-hedger-0-37", label: "Strategic Hedger 3" },
];

export default function Dashboard() {
  const [selectedVisitorId, setSelectedVisitorId] = useState(
    VISITOR_PROFILES[0].id
  );
  const [rfyRecs, setRfyRecs] = useState<IRecommendationResult[]>([]);
  const [recentlyViewedRecs, setRecentlyViewedRecs] = useState<
    IRecommendationResult[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRecommendations = async () => {
      if (!selectedVisitorId) return;

      setLoading(true);
      try {
        // Fetch both sets of recommendations in parallel for efficiency
        const [rfyResponse, recentlyViewedResponse] = await Promise.all([
          fetch(
            `/api/recommendations?modelType=rfy&visitorId=${selectedVisitorId}`
          ),
          fetch(
            `/api/recommendations?modelType=rv&visitorId=${selectedVisitorId}`
          ),
        ]);

        const rfyData = await rfyResponse.json();
        const recentlyViewedData = await recentlyViewedResponse.json();

        setRfyRecs(rfyData.results || []);
        setRecentlyViewedRecs(recentlyViewedData.results || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRfyRecs([]);
        setRecentlyViewedRecs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecommendations();
  }, [selectedVisitorId]);

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          Personalized Dashboard
        </h1>

        <div className="flex items-center space-x-2">
          <label htmlFor="visitor-select" className="text-sm font-medium">
            Select a Client Profile:
          </label>
          <Select
            onValueChange={setSelectedVisitorId}
            defaultValue={selectedVisitorId}
          >
            <SelectTrigger id="visitor-select" className="w-[280px]">
              <SelectValue placeholder="Select a client profile..." />
            </SelectTrigger>
            <SelectContent>
              {VISITOR_PROFILES.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">
          Your Recently Viewed Stocks
        </h2>
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
              <ProductCard
                key={rec.id}
                product={protoJsonToJs(rec.metadata?.product)}
              />
            ))
          ) : (
            <p>No recent activity found.</p>
          )}
        </div>
      </section>

      <Separator />

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Recommended For You</h2>
        <RecommendationHeader visitorId={selectedVisitorId} />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 20 }).map((x, i) => (
              <Skeleton className="h-42 w-full" key={i} />
            ))
          ) : rfyRecs.length > 0 ? (
            rfyRecs.map((rec) => (
              <ProductCard
                key={rec.id}
                product={protoJsonToJs(rec.metadata?.product)}
              />
            ))
          ) : (
            <p>No recommendations found for this profile.</p>
          )}
        </div>
      </section>
    </main>
  );
}
