import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getBearerToken, safeCompare } from "@/lib/security";

export const runtime = "edge";

export async function POST(request: Request) {
  const expected = process.env.WORKER_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "WORKER_SECRET is not configured." }, { status: 500 });
  }
  const token = getBearerToken(request.headers.get("authorization"));
  const authorized = await safeCompare(token, expected);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as {
    job_id?: string;
    status?: string;
    video_r2_key?: string | null;
    thumbnail_r2_key?: string | null;
    duration_sec?: number | null;
    error_message?: string | null;
  } | null;

  if (!payload?.job_id || !payload?.status) {
    return NextResponse.json({ error: "Invalid callback payload." }, { status: 400 });
  }

  const admin = await createAdminClient();
  await admin
    .from("jobs")
    .update({
      status: payload.status,
      video_r2_key: payload.video_r2_key ?? null,
      thumbnail_r2_key: payload.thumbnail_r2_key ?? null,
      duration_sec: payload.duration_sec ?? null,
      error_message: payload.error_message ?? null
    })
    .eq("id", payload.job_id);

  return NextResponse.json({ ok: true });
}
