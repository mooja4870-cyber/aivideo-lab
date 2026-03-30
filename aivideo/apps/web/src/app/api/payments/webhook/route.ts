import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { safeCompare } from "@/lib/security";

export const runtime = "edge";

export async function POST(request: Request) {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "TOSS_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }
  const provided = request.headers.get("x-toss-signature") ?? "";
  const ok = await safeCompare(provided, webhookSecret);
  if (!ok) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const event = (await request.json().catch(() => null)) as {
    eventType?: string;
    data?: { orderId?: string; amount?: number; reason?: string };
  } | null;
  if (!event?.eventType || !event.data?.orderId) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const admin = await createAdminClient();
  if (event.eventType === "PAYMENT_CANCELED") {
    await admin.rpc("fail_payment", {
      p_order_id: event.data.orderId,
      p_reason: event.data.reason ?? "payment canceled"
    });
  }
  if (event.eventType === "PAYMENT_REFUNDED") {
    await admin.rpc("refund_payment", {
      p_order_id: event.data.orderId,
      p_amount: event.data.amount ?? 0
    });
  }

  return NextResponse.json({ ok: true });
}
