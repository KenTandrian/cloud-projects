import { v2alpha } from "@google-cloud/retail";
import { NextRequest, NextResponse } from "next/server";

import { assertEnv } from "@/lib/utils";

const client = new v2alpha.SearchServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const visitorId = searchParams.get("visitorId");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const placement = client.servingConfigPath(
    projectId,
    "global",
    "default_catalog",
    "default_search"
  );

  try {
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
    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
