import { Badge } from "@/components/ui/badge";

export function CreditBadge({ credits }: { credits: number }) {
  return <Badge variant="muted">남은 크레딧 {credits}</Badge>;
}

