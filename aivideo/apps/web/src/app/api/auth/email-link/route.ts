import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_DEFAULT_MESSAGE = "이메일 전송 요청이 너무 많습니다. 1분 후 다시 시도해주세요.";

function toSafeNextPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/dashboard";
  }
  return value;
}

function toServerErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("required")) {
    return "로그인 설정이 올바르지 않습니다. 관리자에게 문의해주세요.";
  }
  return "로그인 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

function isRateLimitMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("rate limit") ||
    normalized.includes("too many request") ||
    normalized.includes("for security purposes") ||
    normalized.includes("only request this after")
  );
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { email?: string; next?: string } | null;
  const email = (payload?.email ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "유효한 이메일을 입력해주세요." }, { status: 400 });
  }

  const nextPath = toSafeNextPath(payload?.next);
  const requestUrl = new URL(request.url);
  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  callbackUrl.searchParams.set("next", nextPath);

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString()
      }
    });
    if (error) {
      if (isRateLimitMessage(error.message)) {
        return NextResponse.json({ error: RATE_LIMIT_DEFAULT_MESSAGE }, { status: 429 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: toServerErrorMessage(error) }, { status: 500 });
  }
}
