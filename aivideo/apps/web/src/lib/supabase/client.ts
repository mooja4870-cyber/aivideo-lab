"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getClientConfigError() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return "로그인 설정이 아직 완료되지 않았습니다. 잠시 후 다시 시도하거나 관리자에게 문의해주세요.";
  }
  return null;
}

export function createClient() {
  const configError = getClientConfigError();
  if (configError) {
    throw new Error(configError);
  }
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
