import { PredictionServiceClient } from "@google-cloud/retail";
import { google } from "@google-cloud/retail/build/protos/protos";

const predClient = new PredictionServiceClient();
const projectId = process.env.GCLOUD_PROJECT;

type ModelConfig = {
  active: boolean;
  eventType: "home-page-view" | "detail-page-view";
  servingConfigId: string;
};

export const modelMap: Record<string, ModelConfig> = {
  buy_it_again: {
    active: true,
    eventType: "home-page-view",
    servingConfigId: "buy-it-again",
  },
  fbt: {
    active: true,
    eventType: "detail-page-view",
    servingConfigId: "fbt0",
  },
  oyml: {
    active: true,
    eventType: "detail-page-view",
    servingConfigId: "oyml",
  },
  rec_for_you: {
    active: true,
    eventType: "home-page-view",
    servingConfigId: "rfy2",
  },
  recently_viewed: {
    active: true,
    eventType: "home-page-view",
    servingConfigId: "recently_viewed_default",
  },
  similar_items: {
    active: true,
    eventType: "detail-page-view",
    servingConfigId: "similar-items-1",
  },
};

export async function getRecommendations(
  modelType: keyof typeof modelMap,
  productId: string,
  visitorId: string,
  request?: Omit<
    google.cloud.retail.v2beta.IPredictRequest,
    "placement" | "userEvent" | "params" | "validateOnly"
  >
) {
  const modelConfig = modelMap[modelType];
  const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/servingConfigs/${modelConfig.servingConfigId}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEvent: any = {
    visitorId: visitorId,
    eventType: modelConfig.eventType,
  };

  if (modelConfig.eventType === "detail-page-view") {
    userEvent.productDetails = [{ product: { id: productId } }];
  }

  const [response] = await predClient.predict({
    ...request,
    placement,
    userEvent,
    params: {
      returnProduct: { boolValue: true },
    },
    validateOnly: !modelConfig.active,
  });
  return response.results ?? [];
}
