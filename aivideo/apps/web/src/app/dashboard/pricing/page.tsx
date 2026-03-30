import { PRICING_TIERS } from "@/lib/constants";
import { PricingCard } from "@/components/pricing-card";

export default function PricingPage() {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold">크레딧 요금제</h2>
      <div className="grid-auto">
        {PRICING_TIERS.map((tier) => (
          <PricingCard
            key={tier.id}
            name={tier.name}
            credits={tier.credits}
            priceKrw={tier.priceKrw}
            href={`/dashboard/payments/success?plan=${tier.id}`}
          />
        ))}
      </div>
    </section>
  );
}

