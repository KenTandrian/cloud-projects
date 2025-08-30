import { UserEventServiceClient } from "@google-cloud/retail";
import { google } from "@google-cloud/retail/build/protos/protos";

import { assertEnv } from "@/lib/utils";

const client = new UserEventServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");
const parent = client.catalogPath(projectId, "global", "default_catalog");

export async function writeUserEvent(
  event: Omit<google.cloud.retail.v2alpha.IUserEvent, "eventTime">
) {
  const userEvent: google.cloud.retail.v2alpha.IUserEvent = {
    ...event,
    eventTime: {
      seconds: Math.floor(Date.now() / 1000),
    },
  };

  return await client.writeUserEvent({
    parent,
    userEvent,
  });
}
