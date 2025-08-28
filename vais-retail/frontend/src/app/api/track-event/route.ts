import { UserEventServiceClient } from "@google-cloud/retail";
import { google } from "@google-cloud/retail/build/protos/protos";
import { type NextRequest, NextResponse } from "next/server";

const client = new UserEventServiceClient();
const projectId = process.env.GCLOUD_PROJECT;
const parent = `projects/${projectId}/locations/global/catalogs/default_catalog`;

export async function POST(request: NextRequest) {
  try {
    const { attributionToken, eventType, visitorId, productId } =
      await request.json();

    if (!eventType || !visitorId || !productId) {
      return NextResponse.json(
        { error: "Missing required event parameters" },
        { status: 400 }
      );
    }

    // Construct the UserEvent object as expected by the API
    const userEvent: google.cloud.retail.v2beta.IUserEvent = {
      eventType,
      visitorId,
      eventTime: {
        seconds: Math.floor(Date.now() / 1000),
      },
      productDetails: [
        {
          product: { id: productId },
        },
      ],
    };

    if (attributionToken) {
      userEvent.attributionToken = attributionToken;
    }

    // Write the event to the Retail API
    await client.writeUserEvent({
      parent: parent,
      userEvent: userEvent,
    });

    // Respond with success. The frontend doesn't need to wait for this.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to write user event:", error);
    // Even if this fails, we don't want to block the user, so we still return a success-like response
    // In a real app, you would log this error for monitoring.
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
