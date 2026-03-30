import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { buildPublicR2Url } from "@/lib/r2";

export const runtime = "edge";

async function resolveUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = await createAdminClient();
  const { data } = await admin
    .from("jobs")
    .select("video_r2_key")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  const key = data?.video_r2_key;
  if (!key) {
    return NextResponse.json({ error: "No downloadable video yet." }, { status: 404 });
  }
  return NextResponse.json({ url: buildPublicR2Url(key) });
}
