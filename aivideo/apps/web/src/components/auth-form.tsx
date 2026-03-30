"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setLoading(false);
    setMessage(error ? `로그인 링크 전송 실패: ${error.message}` : "로그인 링크를 이메일로 보냈습니다.");
  }

  async function signInWithProvider(provider: "google" | "kakao") {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={signInWithEmail} className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="email">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.kr"
          />
          <Button disabled={loading} className="w-full" type="submit">
            이메일 링크로 로그인
          </Button>
        </form>
        <div className="mt-3 grid gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => startTransition(() => void signInWithProvider("google"))}
          >
            Google 로그인
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => startTransition(() => void signInWithProvider("kakao"))}
          >
            Kakao 로그인
          </Button>
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--muted)]">{message}</p> : null}
        <div className="mt-4">
          <Button type="button" variant="ghost" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

