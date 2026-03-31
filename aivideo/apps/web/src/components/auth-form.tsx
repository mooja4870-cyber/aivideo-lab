"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient, getClientConfigError } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AUTH_TIMEOUT_MS = 12000;
const AUTH_RETRY_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed") ||
    normalized.includes("networkerror") ||
    normalized.includes("load failed")
  );
}

function toUserSafeAuthError(message: string, fallback: string) {
  if (message === "AUTH_TIMEOUT") {
    return "인증 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.";
  }
  if (isNetworkErrorMessage(message)) {
    return "네트워크 연결 또는 인증 서버 접근에 문제가 있습니다. 잠시 후 다시 시도해주세요.";
  }
  return `${fallback}: ${message}`;
}

async function withTimeout<T>(request: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AUTH_TIMEOUT")), timeoutMs);
    request
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function runAuthRequest<T>(request: () => Promise<T>) {
  try {
    return await withTimeout(request(), AUTH_TIMEOUT_MS);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTH_TIMEOUT" || isNetworkErrorMessage(message)) {
      await sleep(AUTH_RETRY_DELAY_MS);
      return withTimeout(request(), AUTH_TIMEOUT_MS);
    }
    throw error;
  }
}

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const configError = getClientConfigError();
  const visibleMessage = message || configError || "";

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    if (configError) {
      setMessage(configError);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await runAuthRequest(() =>
        supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: redirectTo }
        })
      );
      if (error) {
        setMessage(toUserSafeAuthError(error.message, "로그인 링크 전송 실패"));
        return;
      }
      setMessage("로그인 링크를 이메일로 보냈습니다. 메일함(스팸함 포함)을 확인해주세요.");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(toUserSafeAuthError(error.message, "로그인 링크 전송 실패"));
      } else {
        setMessage("로그인 링크 전송 실패: 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function signInWithProvider(provider: "google" | "kakao") {
    if (configError) {
      setMessage(configError);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await runAuthRequest(() =>
        supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      );
      if (error) {
        const providerLabel = provider === "google" ? "Google" : "Kakao";
        setMessage(toUserSafeAuthError(error.message, `${providerLabel} 로그인 실패`));
      }
    } catch (error) {
      const providerLabel = provider === "google" ? "Google" : "Kakao";
      if (error instanceof Error) {
        setMessage(toUserSafeAuthError(error.message, `${providerLabel} 로그인 실패`));
      } else {
        setMessage(`${providerLabel} 로그인 실패: 알 수 없는 오류가 발생했습니다.`);
      }
    } finally {
      setLoading(false);
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
          <Button disabled={loading || Boolean(configError)} className="w-full" type="submit">
            이메일 링크로 로그인
          </Button>
        </form>
        <div className="mt-3 grid gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loading || Boolean(configError)}
            onClick={() => startTransition(() => void signInWithProvider("google"))}
          >
            Google 로그인
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading || Boolean(configError)}
            onClick={() => startTransition(() => void signInWithProvider("kakao"))}
          >
            Kakao 로그인
          </Button>
        </div>
        {visibleMessage ? <p className="mt-4 text-sm text-[var(--muted)]">{visibleMessage}</p> : null}
        <div className="mt-4">
          <Button type="button" variant="ghost" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
