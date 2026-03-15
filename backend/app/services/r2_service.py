"""Cloudflare R2 document storage service (S3-compatible API).

Graceful fallback: if R2 env vars are not set, operations log warnings
and return placeholder values instead of crashing.
"""
import logging
import boto3
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger(__name__)


def _get_r2_client():
    """Get R2 (S3-compatible) client. Returns None if not configured."""
    if not all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY]):
        return None
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def upload_document(file_bytes: bytes, file_path: str, content_type: str = "application/octet-stream") -> str:
    """Upload file to R2. Returns the storage key, or placeholder if R2 not configured."""
    client = _get_r2_client()
    if not client:
        logger.warning(f"[R2] Not configured — document '{file_path}' not uploaded. Set R2_* env vars.")
        return file_path  # Return path as-is; metadata row still created

    try:
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=file_path,
            Body=file_bytes,
            ContentType=content_type,
        )
        logger.info(f"[R2] Uploaded: {file_path}")
        return file_path
    except ClientError as e:
        logger.error(f"[R2 UPLOAD ERROR] {e}")
        raise


def get_signed_url(file_path: str, expiry_seconds: int = 900) -> str:
    """Generate a pre-signed URL for downloading. Falls back to placeholder if R2 not configured."""
    client = _get_r2_client()
    if not client:
        logger.warning(f"[R2] Not configured — returning placeholder URL for '{file_path}'.")
        return f"https://placeholder.propmanage.app/{file_path}"

    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.R2_BUCKET_NAME, "Key": file_path},
            ExpiresIn=expiry_seconds,
        )
        return url
    except ClientError as e:
        logger.error(f"[R2 SIGNED URL ERROR] {e}")
        raise


def delete_document(file_path: str) -> bool:
    """Delete a file from R2. Returns False if not configured or on error."""
    client = _get_r2_client()
    if not client:
        logger.warning(f"[R2] Not configured — cannot delete '{file_path}'.")
        return False
    try:
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
        logger.info(f"[R2] Deleted: {file_path}")
        return True
    except ClientError as e:
        logger.error(f"[R2 DELETE ERROR] {e}")
        return False
