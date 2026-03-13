"""AI Agent endpoints."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import AgentChatRequest, AgentChatResponse

router = APIRouter()


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(request: AgentChatRequest):
    """Send message to AI agent, get response."""
    raise HTTPException(status_code=501, detail="AI Agent not implemented yet")


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Upload audio file and get transcription (Whisper)."""
    raise HTTPException(status_code=501, detail="Voice transcription not implemented yet")


@router.get("/history/{session_id}")
async def get_agent_history(session_id: str):
    """Get conversation history for a session."""
    raise HTTPException(status_code=501, detail="Not implemented yet")
