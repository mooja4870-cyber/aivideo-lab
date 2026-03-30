import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "edge";

function encodeBasicAuth(secretKey: string) {
  return `Basic ${btoa(`${secretKey}:`)}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
    userId?: string;
    credits?: number;
  } | null;

  if (!body?.paymentKey || !body.orderId || typeof body.amount !== "number") {
    return NextResponse.json({ error: "Invalid payment confirmation payload." }, { status: 400 });
  }

  const tossSecret = process.env.TOSS_SECRET_KEY;
  if (!tossSecret) {
    return NextResponse.json({ error: "TOSS_SECRET_KEY is not configured." }, { status: 500 });
  }
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: encodeBasicAuth(tossSecret),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      amount: body.amount
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ error: result }, { status: 400 });
  }

  if (body.userId && body.credits) {
    const admin = await createAdminClient();
    await admin.rpc("confirm_payment", {
      p_order_id: body.orderId,
      p_user_id: body.userId,
      p_amount: body.amount,
      p_credits: body.credits
    });
  }

  return NextResponse.json({ ok: true, data: result });
}
