import { NextRequest, NextResponse } from "next/server";

// Brevo webhook handler
// Events: delivered, opened, uniqueOpened, click, hardBounce, softBounce, unsubscribed, spam, listAddition
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event,
      email,
      "message-id": messageId,
      "campaign_id": campaignId,
      link,
      date,
      tag,
    } = body;

    // TODO: Verify webhook signature in production
    // if (!verifyBrevoSignature(req)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    console.log(`[Brevo Webhook] Event: ${event}, Email: ${email}, Campaign: ${campaignId}`);

    switch (event) {
      case "delivered":
        // Update campaign stats cache - increment delivered
        break;
      case "opened":
      case "uniqueOpened":
        // Update campaign stats cache - increment opens
        // Log contact activity
        break;
      case "click":
        // Update campaign stats cache - increment clicks
        // Log contact activity with link
        // Update link click data
        break;
      case "hardBounce":
      case "softBounce":
        // Update campaign stats - increment bounces
        // Update contact status
        break;
      case "unsubscribed":
        // Update campaign stats - increment unsubscribes
        // Update contact status to unsubscribed
        break;
      case "spam":
        // Update campaign stats - increment spam complaints
        // Flag campaign
        break;
      case "listAddition":
        // Update local contact cache
        break;
      default:
        console.log(`[Brevo Webhook] Unknown event: ${event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Brevo Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
