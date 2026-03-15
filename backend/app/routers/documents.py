"""Document management endpoints."""
import uuid
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Form
from app.services.supabase import get_supabase_admin
from app.services.r2_service import upload_document as r2_upload, get_signed_url, delete_document as r2_delete
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
        user_role = user.get("role", "owner")

        if user_role == "tenant":
            # Tenants see only agreement/tenant_kyc docs for their linked properties
            tenancies = (
                admin.table("tenancies")
                .select("property_id")
                .eq("tenant_profile_id", user["id"])
                .execute()
            )
            property_ids = [t["property_id"] for t in (tenancies.data or [])]
            if not property_ids:
                return paginated_response([], 0, page, per_page)

            query = (
                admin.table("documents")
                .select("*, properties(name)", count="exact")
                .in_("property_id", property_ids)
                .in_("category", ["agreement", "tenant_kyc"])
            )
        elif user_role == "manager":
            # Managers see docs for their assigned properties
            access = (
                admin.table("property_access")
                .select("property_id")
                .eq("user_id", user["id"])
                .is_("revoked_at", "null")
                .execute()
            )
            property_ids = [a["property_id"] for a in (access.data or [])]
            if not property_ids:
                return paginated_response([], 0, page, per_page)

            query = (
                admin.table("documents")
                .select("*, properties(name)", count="exact")
                .in_("property_id", property_ids)
            )
        else:
            # Owners see all their documents
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

        # Upload to Cloudflare R2
        r2_upload(content, storage_path, content_type=file.content_type or "application/octet-stream")

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
        user_role = user.get("role", "owner")

        # Fetch document
        response = (
            admin.table("documents")
            .select("*, properties(name)")
            .eq("id", document_id)
            .maybe_single()
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Document not found")

        d = response.data

        # Access check by role
        if user_role == "owner":
            if d["owner_id"] != user["id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        elif user_role == "manager":
            access = (
                admin.table("property_access")
                .select("id")
                .eq("property_id", d["property_id"])
                .eq("user_id", user["id"])
                .is_("revoked_at", "null")
                .maybe_single()
                .execute()
            )
            if not access.data:
                raise HTTPException(status_code=403, detail="Access denied")
        elif user_role == "tenant":
            if d.get("category") not in ["agreement", "tenant_kyc"]:
                raise HTTPException(status_code=403, detail="Access denied")
            tenancy = (
                admin.table("tenancies")
                .select("id")
                .eq("tenant_profile_id", user["id"])
                .eq("property_id", d["property_id"])
                .maybe_single()
                .execute()
            )
            if not tenancy.data:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            raise HTTPException(status_code=403, detail="Access denied")

        return {"data": d}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Get signed URL for document download (15-min expiry).
    
    Supports all 3 roles:
    - Owner: can download any of their documents
    - Manager: can download docs for assigned properties
    - Tenant: can download only agreement/tenant_kyc docs for their tenancy
    """
    try:
        admin = get_supabase_admin()

        # Fetch document
        doc = (
            admin.table("documents")
            .select("*")
            .eq("id", document_id)
            .maybe_single()
            .execute()
        )

        if not doc.data:
            raise HTTPException(status_code=404, detail="Document not found")

        d = doc.data
        user_id = user["id"]
        user_role = user.get("role", "owner")

        # Access check by role
        if user_role == "owner":
            if d["owner_id"] != user_id:
                raise HTTPException(status_code=403, detail="Access denied")

        elif user_role == "manager":
            access = (
                admin.table("property_access")
                .select("id")
                .eq("property_id", d["property_id"])
                .eq("user_id", user_id)
                .is_("revoked_at", "null")
                .maybe_single()
                .execute()
            )
            if not access.data:
                raise HTTPException(status_code=403, detail="Access denied")

        elif user_role == "tenant":
            # Tenant can only view agreement and tenant_kyc documents
            if d.get("category") not in ["agreement", "tenant_kyc"]:
                raise HTTPException(status_code=403, detail="Access denied")
            tenancy = (
                admin.table("tenancies")
                .select("id")
                .eq("tenant_profile_id", user_id)
                .eq("property_id", d["property_id"])
                .maybe_single()
                .execute()
            )
            if not tenancy.data:
                raise HTTPException(status_code=403, detail="Access denied")

        else:
            raise HTTPException(status_code=403, detail="Access denied")

        # Generate signed URL from R2 (15-minute expiry)
        signed_url = get_signed_url(d["file_path"], expiry_seconds=900)
        if not signed_url:
            raise HTTPException(status_code=500, detail="Could not generate download URL")

        return {"url": signed_url, "filename": d.get("title", "document")}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage error: {str(e)}")


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
async def delete_document_endpoint(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a document (remove from R2 storage, soft-delete metadata)."""
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

        # Delete from R2 storage
        r2_delete(doc.data["file_path"])

        # Soft delete: mark with metadata
        admin.table("documents").update({
            "auto_extracted_fields": {"deleted": True}
        }).eq("id", document_id).execute()

        return {"message": "Document deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
