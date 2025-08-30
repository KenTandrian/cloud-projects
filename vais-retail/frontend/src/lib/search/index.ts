import { v2alpha } from "@google-cloud/retail";

import { assertEnv } from "@/lib/utils";

const client = new v2alpha.SearchServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");

export async function search(query: string, visitorId: string) {
  const placement = client.servingConfigPath(
    projectId,
    "global",
    "default_catalog",
    "default_search"
  );

  const [response] = await client.search(
    {
      placement,
      query,
      pageSize: 20,
      queryExpansionSpec: {
        condition: "AUTO",
      },
      visitorId,
    },
    {
      autoPaginate: false,
    }
  );
  return response;
}
