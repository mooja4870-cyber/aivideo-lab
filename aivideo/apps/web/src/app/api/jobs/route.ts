import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { buildR2Prefix } from "@/lib/r2";

export const runtime = "edge";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function getWorkerConfig() {
  return {
    workerUrl: getRequiredEnv("WORKER_API_URL"),
    workerSecret: getRequiredEnv("WORKER_SECRET"),
    callbackBase: getRequiredEnv("NEXT_PUBLIC_APP_URL")
  };
}

async function resolveUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function sanitizeTopic(input: string) {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/[`$]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { topic?: string; language?: string } | null;
  const cleanTopic = sanitizeTopic(body?.topic ?? "");
  if (!cleanTopic) {
    return NextResponse.json({ error: "topic is required." }, { status: 400 });
  }

  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let worker: ReturnType<typeof getWorkerConfig>;
  try {
    worker = getWorkerConfig();
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  const language = body?.language ?? "ko";
  const admin = await createAdminClient();

  let jobId = crypto.randomUUID();
  let remainingCredits = 2;

  const rpcResult = await admin.rpc("create_job_with_credit", {
    p_user_id: userId,
    p_topic: cleanTopic,
    p_language: language
  });
  const rpcJobId = rpcResult.data;

  if (typeof rpcJobId === "string" && rpcJobId) {
    jobId = rpcJobId;
  } else {
    await admin.from("jobs").insert({ id: jobId, user_id: userId, topic: cleanTopic, status: "queued", language });
  }

  const { data: userRow } = await admin.from("users").select("credits").eq("id", userId).maybeSingle();
  if (typeof userRow?.credits === "number") {
    remainingCredits = userRow.credits;
  }

  const r2Prefix = buildR2Prefix(userId, jobId);
  const callbackUrl = `${worker.callbackBase}/api/webhooks/video-complete`;

  await fetch(worker.workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${worker.workerSecret}`
    },
    body: JSON.stringify({
      job_id: jobId,
      topic: cleanTopic,
      language,
      callback_url: callbackUrl,
      r2_prefix: r2Prefix
    })
  }).catch(() => null);

  return NextResponse.json({
    job_id: jobId,
    status: "queued",
    remaining_credits: remainingCredits
  });
}

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const admin = await createAdminClient();
  const { data } = await admin
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ jobs: data ?? [] });
}
