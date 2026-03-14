"""AI Agent endpoints."""
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from app.models.schemas import AgentChatRequest, AgentChatResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request: AgentChatRequest,
    user: dict = Depends(get_current_user),
):
    """Send message to AI agent, get response.
    (Full implementation in Sprint 8 with Google ADK + RAG)
    """
    session_id = request.session_id or str(uuid.uuid4())

    return AgentChatResponse(
        response="👋 Hi! I'm your PropManage AI Agent. I'm currently being trained to help you with property management tasks like searching documents, tracking rent, and answering property law questions. I'll be fully operational soon!",
        session_id=session_id,
        sources=None,
    )


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload audio file and get transcription (Whisper).
    (Full implementation in Sprint 9)
    """
    return {
        "text": "Voice transcription will be available soon.",
        "language": "en",
    }


@router.get("/history/{session_id}")
async def get_agent_history(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Get conversation history for a session."""
    return {
        "session_id": session_id,
        "messages": [],
        "message": "Agent history coming in Sprint 8.",
    }
