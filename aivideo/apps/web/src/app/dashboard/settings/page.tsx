import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <section>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>계정 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3">
            <label htmlFor="name" className="block text-sm font-medium">
              표시 이름
            </label>
            <Input id="name" defaultValue="홍길동" />
            <label htmlFor="email" className="block text-sm font-medium">
              이메일
            </label>
            <Input id="email" type="email" defaultValue="demo@example.com" />
            <Button type="button">저장</Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

