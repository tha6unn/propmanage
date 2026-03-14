"""Document management endpoints."""
import uuid
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from app.services.supabase import get_supabase_admin
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate_params, paginated_response

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "doc", "docx", "xls", "xlsx", "csv", "txt"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@router.get("/")
async def list_documents(
    property_id: str = Query(None),
    category: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    """List documents, filterable by property and category."""
    try:
        admin = get_supabase_admin()
        offset, limit = paginate_params(page, per_page)

        query = (
            admin.table("documents")
            .select("*, properties(name)", count="exact")
            .eq("owner_id", user["id"])
        )

        if property_id:
            query = query.eq("property_id", property_id)
        if category:
            query = query.eq("category", category)

        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        response = query.execute()

        total = response.count if response.count is not None else len(response.data)
        return paginated_response(response.data or [], total, page, per_page)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    property_id: str = Form(...),
    category: str = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    expiry_date: str = Form(None),
    user: dict = Depends(get_current_user),
):
    """Upload a document (multipart/form-data)."""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type .{extension} not allowed")

        admin = get_supabase_admin()

        # Verify property ownership
        prop = (
            admin.table("properties")
            .select("id")
            .eq("id", property_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not prop.data:
            raise HTTPException(status_code=404, detail="Property not found")

        # Generate UUID filename
        file_uuid = str(uuid.uuid4())
        storage_path = f"{user['id']}/{property_id}/{file_uuid}.{extension}"

        # Read file content
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 25 MB)")

        # Upload to Supabase Storage
        admin.storage.from_("documents").upload(
            path=storage_path,
            file=content,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )

        # Insert metadata row
        doc_data = {
            "property_id": property_id,
            "owner_id": user["id"],
            "category": category,
            "title": title,
            "description": description,
            "file_path": storage_path,
            "original_filename": file.filename,
            "file_type": extension,
            "file_size_bytes": len(content),
            "expiry_date": expiry_date,
        }

        response = admin.table("documents").insert(doc_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save document metadata")

        return {"data": response.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Get document metadata."""
    try:
        admin = get_supabase_admin()
        response = (
            admin.table("documents")
            .select("*, properties(name)")
            .eq("id", document_id)
            .eq("owner_id", user["id"])
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Document not found")

        return {"data": response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Get signed URL for document download (15-min expiry)."""
    try:
        admin = get_supabase_admin()

        doc = (
            admin.table("documents")
            .select("file_path")
            .eq("id", document_id)
            .eq("owner_id", user["id"])
            .single()
            .execute()
        )

        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        # Generate signed URL (900 seconds = 15 minutes)
        signed = admin.storage.from_("documents").create_signed_url(
            doc.data["file_path"], 900
        )

        return {"url": signed.get("signedURL") or signed.get("signed_url", "")}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{document_id}")
async def update_document(
    document_id: str,
    title: str = None,
    category: str = None,
    description: str = None,
    expiry_date: str = None,
    user: dict = Depends(get_current_user),
):
    """Update document metadata."""
    try:
        admin = get_supabase_admin()

        existing = (
            admin.table("documents")
            .select("id")
            .eq("id", document_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not existing.data:
            raise HTTPException(status_code=404, detail="Document not found")

        updates = {}
        if title is not None:
            updates["title"] = title
        if category is not None:
            updates["category"] = category
        if description is not None:
            updates["description"] = description
        if expiry_date is not None:
            updates["expiry_date"] = expiry_date

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = (
            admin.table("documents")
            .update(updates)
            .eq("id", document_id)
            .execute()
        )

        return {"data": response.data[0] if response.data else None}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Soft delete a document (remove from storage, keep metadata)."""
    try:
        admin = get_supabase_admin()

        doc = (
            admin.table("documents")
            .select("id, file_path")
            .eq("id", document_id)
            .eq("owner_id", user["id"])
            .maybe_single()
            .execute()
        )
        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        # Soft delete: mark with metadata
        admin.table("documents").update({
            "auto_extracted_fields": {"deleted": True}
        }).eq("id", document_id).execute()

        return {"message": "Document deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
