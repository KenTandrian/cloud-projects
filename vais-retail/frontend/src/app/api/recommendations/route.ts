import { getRecommendations, modelMap } from "@/lib/recommendations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelType = searchParams.get("modelType");
  const productId = searchParams.get("productId");
  const visitorId = searchParams.get("visitorId");
  const pageSize = searchParams.get("pageSize");

  if (!modelType || !visitorId) {
    return NextResponse.json(
      { error: "modelType and visitorId are required" },
      { status: 400 }
    );
  }

  if (!Object.keys(modelMap).includes(modelType)) {
    return NextResponse.json({ error: "Invalid modelType" }, { status: 400 });
  }

  const modelConfig = modelMap[modelType];
  if (modelConfig.eventType === "detail-page-view" && !productId) {
    return NextResponse.json(
      { error: "productId is required for this modelType" },
      { status: 400 }
    );
  }

  try {
    const results = await getRecommendations(
      modelType,
      productId ?? "",
      visitorId,
      { pageSize: pageSize ? parseInt(pageSize) : undefined }
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error(`Prediction API Error for ${modelType}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
