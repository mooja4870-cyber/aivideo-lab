import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const FALLBACK_R2_PUBLIC_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://pub.example.com";

function getR2Config() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 environment variables are required for presigned URLs.");
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket
  };
}

export async function generatePresignedUrl(key: string, expiresIn = 60 * 10) {
  const cfg = getR2Config();
  const client = new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey
    }
  });
  const command = new GetObjectCommand({
    Bucket: cfg.bucket,
    Key: key
  });
  return getSignedUrl(client, command, { expiresIn });
}

export function buildR2Prefix(userId: string, jobId: string) {
  return `users/${userId}/jobs/${jobId}`;
}

export function buildPublicR2Url(key: string) {
  return `${FALLBACK_R2_PUBLIC_BASE.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}
