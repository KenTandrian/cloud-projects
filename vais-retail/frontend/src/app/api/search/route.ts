import { NextRequest, NextResponse } from "next/server";
import { v2alpha } from "@google-cloud/retail";

const client = new v2alpha.SearchServiceClient();
const projectId = process.env.GCLOUD_PROJECT;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/servingConfigs/default_search`;

  try {
    const [response] = await client.search(
      {
        placement,
        query,
        pageSize: 20,
        queryExpansionSpec: {
          condition: "AUTO",
        },
        visitorId: "visitor-value-1-1",
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
