import { CompletionServiceClient } from "@google-cloud/retail";
import { NextRequest, NextResponse } from "next/server";

import { assertEnv } from "@/lib/utils";

const client = new CompletionServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const catalogId = client.catalogPath(projectId, "global", "default_catalog");

  try {
    const [response] = await client.completeQuery({
      catalog: catalogId,
      query: query,
      visitorId: "demo-visitor-id",
      // You can limit the number of suggestions
      maxSuggestions: 5,
    });

    // Extract just the suggestion strings to send to the client
    const suggestions =
      response.completionResults?.map((result) => result.suggestion) ?? [];
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch autocomplete suggestions" },
      { status: 500 }
    );
  }
}
