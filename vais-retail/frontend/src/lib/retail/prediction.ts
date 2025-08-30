import { assertEnv } from "@/lib/utils";
import type { EventType, ServingConfig } from "@/types/recommendation";
import { PredictionServiceClient } from "@google-cloud/retail";
import { google } from "@google-cloud/retail/build/protos/protos";

const predClient = new PredictionServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");

export const servingConfigMap: Record<EventType, ServingConfig> = {
  buy_it_again: {
    active: true,
    eventType: "home-page-view",
    id: assertEnv("SERVING_CONFIG_ID_BUY_IT_AGAIN"),
  },
  frequently_bought_together: {
    active: true,
    eventType: "detail-page-view",
    id: assertEnv("SERVING_CONFIG_ID_FREQUENTLY_BOUGHT_TOGETHER"),
  },
  others_you_may_like: {
    active: true,
    eventType: "detail-page-view",
    id: assertEnv("SERVING_CONFIG_ID_OTHERS_YOU_MAY_LIKE"),
  },
  recommended_for_you: {
    active: true,
    eventType: "home-page-view",
    id: assertEnv("SERVING_CONFIG_ID_RECOMMENDED_FOR_YOU"),
  },
  recently_viewed: {
    active: true,
    eventType: "home-page-view",
    id: assertEnv("SERVING_CONFIG_ID_RECENTLY_VIEWED"),
  },
  similar_items: {
    active: true,
    eventType: "detail-page-view",
    id: assertEnv("SERVING_CONFIG_ID_SIMILAR_ITEMS"),
  },
};

export async function getRecommendations(
  modelType: EventType,
  productId: string,
  visitorId: string,
  request?: Omit<
    google.cloud.retail.v2beta.IPredictRequest,
    "placement" | "userEvent" | "params" | "validateOnly"
  >
) {
  const servingConfig = servingConfigMap[modelType];
  const placement = predClient.servingConfigPath(
    projectId,
    "global",
    "default_catalog",
    servingConfig.id
  );

  const userEvent: google.cloud.retail.v2beta.IUserEvent = {
    visitorId: visitorId,
    eventType: servingConfig.eventType,
  };

  if (servingConfig.eventType === "detail-page-view") {
    userEvent.productDetails = [{ product: { id: productId } }];
  }

  const [response] = await predClient.predict({
    ...request,
    placement,
    userEvent,
    params: {
      returnProduct: { boolValue: true },
    },
    validateOnly: !servingConfig.active,
  });
  return response;
}
