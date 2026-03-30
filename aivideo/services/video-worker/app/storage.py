from __future__ import annotations

import mimetypes
from pathlib import Path


def upload_to_r2(
    local_path: str | Path,
    r2_key: str,
    endpoint: str,
    access_key: str,
    secret_key: str,
    bucket: str,
) -> str:
    """Upload local file to Cloudflare R2 via S3-compatible boto3 client."""
    import boto3

    source = Path(local_path)
    if not source.exists():
        raise FileNotFoundError(f"Missing file for upload: {source}")

    content_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
    )
    client.upload_file(
        str(source),
        bucket,
        r2_key,
        ExtraArgs={"ContentType": content_type},
    )
    return f"{endpoint.rstrip('/')}/{bucket}/{r2_key}"

