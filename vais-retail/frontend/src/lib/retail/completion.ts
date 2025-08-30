import { CompletionServiceClient } from "@google-cloud/retail";

import { assertEnv } from "@/lib/utils";

const client = new CompletionServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");
const catalogId = client.catalogPath(projectId, "global", "default_catalog");

export async function completeQuery(query: string, visitorId?: string) {
  const [response] = await client.completeQuery({
    query,
    visitorId,
    catalog: catalogId,
    maxSuggestions: 5,
  });

  const suggestions =
    response.completionResults?.map((result) => result.suggestion) ?? [];
  return suggestions;
}
