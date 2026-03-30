import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

type PricingCardProps = {
  name: string;
  credits: number;
  priceKrw: number;
  href: string;
};

export function PricingCard({ name, credits, priceKrw, href }: PricingCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{credits} 크레딧 제공</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-2xl font-bold">{formatPrice(priceKrw)}</p>
        <Link href={href} className="block">
          <Button className="w-full">선택하기</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

