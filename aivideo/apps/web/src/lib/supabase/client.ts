"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes("example.") ||
    normalized.includes("placeholder") ||
    normalized.includes(".invalid") ||
    normalized.includes("changeme") ||
    normalized.startsWith("test_") ||
    normalized.startsWith("local-")
  );
}

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }
    if (isPlaceholderValue(url.hostname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getClientConfigError() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return "로그인 설정이 아직 완료되지 않았습니다. 잠시 후 다시 시도하거나 관리자에게 문의해주세요.";
  }
  if (!isValidSupabaseUrl(SUPABASE_URL) || isPlaceholderValue(SUPABASE_ANON_KEY)) {
    return "로그인 설정이 올바르지 않습니다. NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY 값을 확인해주세요.";
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
