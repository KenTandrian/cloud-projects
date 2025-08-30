"use client";

import { ProductPanel } from "@/components/product-panel";
import { RecommendationHeader } from "@/components/reco-header";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  return (
    <main className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          Personalized Dashboard
        </h1>
      </div>

      <ProductPanel
        modelType="recommended_for_you"
        title="Recommended For You"
        header={<RecommendationHeader />}
      />

      <Separator />

      <ProductPanel
        modelType="recently_viewed"
        title="Recently Viewed"
        description="A simple recap of your recent activity."
      />

      <Separator />

      <ProductPanel
        modelType="buy_it_again"
        title="Buy It Again!"
        description="Encourage recurring investments based on the client's purchase history."
      />
    </main>
  );
}
