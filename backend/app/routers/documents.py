"""Document management endpoints."""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

router = APIRouter()


@router.get("/")
async def list_documents(property_id: str = None, category: str = None):
    """List documents, filterable by property and category."""
    return {"data": [], "meta": {"total": 0, "page": 1}}


@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    property_id: str = Form(...),
    category: str = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    expiry_date: str = Form(None),
):
    """Upload a document (multipart/form-data)."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{document_id}")
async def get_document(document_id: str):
    """Get document metadata."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{document_id}/download")
async def download_document(document_id: str):
    """Get signed URL for document download."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{document_id}")
async def update_document(document_id: str):
    """Update document metadata."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Soft delete a document."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/search")
async def search_documents(q: str = ""):
    """Full-text search over extracted document text."""
    raise HTTPException(status_code=501, detail="Not implemented yet")
