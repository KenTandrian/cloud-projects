"use client";

import { useVisitorIdContext } from "@/components/layout/visitor-id-provider";
import { ProductPanel } from "@/components/product-panel";
import { RecommendationHeader } from "@/components/reco-header";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { visitorId: selectedVisitorId } = useVisitorIdContext();

  return (
    <main className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          Personalized Dashboard
        </h1>
      </div>

      <ProductPanel
        modelType="recommended_for_you"
        visitorId={selectedVisitorId}
        title="Recommended For You"
        header={<RecommendationHeader visitorId={selectedVisitorId} />}
      />

      <Separator />

      <ProductPanel
        modelType="recently_viewed"
        visitorId={selectedVisitorId}
        title="Recently Viewed"
        description="A simple recap of your recent activity."
      />

      <Separator />

      <ProductPanel
        modelType="buy_it_again"
        visitorId={selectedVisitorId}
        title="Buy It Again!"
        description="Encourage recurring investments based on the client's purchase history."
      />
    </main>
  );
}
