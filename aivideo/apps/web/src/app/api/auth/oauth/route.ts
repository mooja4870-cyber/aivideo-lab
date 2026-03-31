import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

type Provider = "google" | "kakao";

function toSafeNextPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/dashboard";
  }
  return value;
}

function toSafeProvider(value: unknown): Provider | null {
  if (value === "google" || value === "kakao") {
    return value;
  }
  return null;
}

function toServerErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("required")) {
    return "로그인 설정이 올바르지 않습니다. 관리자에게 문의해주세요.";
  }
  return "로그인 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { provider?: Provider; next?: string } | null;
  const provider = toSafeProvider(payload?.provider);
  if (!provider) {
    return NextResponse.json({ error: "지원하지 않는 로그인 제공자입니다." }, { status: 400 });
  }

  const nextPath = toSafeNextPath(payload?.next);
  const requestUrl = new URL(request.url);
  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  callbackUrl.searchParams.set("next", nextPath);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString()
      }
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data?.url) {
      return NextResponse.json({ error: "인증 URL 생성에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: data.url });
  } catch (error) {
    return NextResponse.json({ error: toServerErrorMessage(error) }, { status: 500 });
  }
}
