from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import process_chat
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI chatbot endpoint.
    Accepts a message and conversation history.
    Returns a response with restaurant recommendations.
    """
    # Convert schema objects to dicts for the service
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in payload.conversation_history
    ]

    result = await process_chat(
        user_message=payload.message,
        conversation_history=history,
        user_id=current_user.id,
        db=db
    )

    return ChatResponse(
        response=result["response"],
        restaurants=result["restaurants"],
        filters_used=result["filters_used"]
    )