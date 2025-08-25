import { NextRequest, NextResponse } from "next/server";
import { PredictionServiceClient } from "@google-cloud/retail";

const client = new PredictionServiceClient();
const projectId = process.env.GCLOUD_PROJECT;

const modelMap: Record<string, string> = {
  fbt: "fbt0",
  oyml: "oyml",
  rfy: "rfy2",
  rv: "recently_viewed_default",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelType = searchParams.get("modelType"); // 'rfy', 'oyml', 'fbt', 'rv'
  const productId = searchParams.get("productId");
  const visitorId = searchParams.get("visitorId");

  if (!modelType || !visitorId) {
    return NextResponse.json(
      { error: "modelType and visitorId are required" },
      { status: 400 }
    );
  }

  // The Serving Config ID must match the modelType
  const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/servingConfigs/${modelMap[modelType]}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEvent: any = {
    visitorId: visitorId,
  };

  // Set the correct eventType based on the model
  if (modelType === "rfy" || modelType === "rv") {
    userEvent.eventType = "home-page-view";
  } else {
    userEvent.eventType = "detail-page-view";
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required for this modelType" },
        { status: 400 }
      );
    }
    userEvent.productDetails = [{ product: { id: productId } }];
  }

  try {
    const [response] = await client.predict({
      placement,
      userEvent,
      params: {
        returnProduct: { boolValue: true },
      },
      validateOnly: modelType !== "rv",
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Prediction API Error for ${modelType}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
