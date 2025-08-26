import { PredictionServiceClient } from "@google-cloud/retail";
import { NextRequest, NextResponse } from "next/server";

const client = new PredictionServiceClient();
const projectId = process.env.GCLOUD_PROJECT;

type ModelConfig = {
  active: boolean;
  eventType: "home-page-view" | "detail-page-view";
  servingConfigId: string;
};

const modelMap: Record<string, ModelConfig> = {
  fbt: {
    active: false,
    eventType: "detail-page-view",
    servingConfigId: "fbt0",
  },
  oyml: {
    active: false,
    eventType: "detail-page-view",
    servingConfigId: "oyml",
  },
  rec_for_you: {
    active: false,
    eventType: "home-page-view",
    servingConfigId: "rfy2",
  },
  recently_viewed: {
    active: true,
    eventType: "home-page-view",
    servingConfigId: "recently_viewed_default",
  },
  buy_it_again: {
    active: true,
    eventType: "home-page-view",
    servingConfigId: "buy-it-again",
  },
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

  const modelConfig = modelMap[modelType];

  // The Serving Config ID must match the modelType
  const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/servingConfigs/${modelConfig.servingConfigId}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEvent: any = {
    visitorId: visitorId,
  };

  // Set the correct eventType based on the model
  userEvent.eventType = modelConfig.eventType;
  if (modelConfig.eventType === "detail-page-view") {
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
      validateOnly: !modelConfig.active,
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
