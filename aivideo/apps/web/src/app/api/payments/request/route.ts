import { NextResponse } from "next/server";
import { PRICING_TIERS } from "@/lib/constants";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { tierId?: string } | null;
  const tier = PRICING_TIERS.find((item) => item.id === payload?.tierId) ?? PRICING_TIERS[0];
  const orderId = `order_${crypto.randomUUID()}`;
  return NextResponse.json({
    orderId,
    amount: tier.priceKrw,
    credits: tier.credits,
    orderName: `${tier.name} ${tier.credits}크레딧`
  });
}

