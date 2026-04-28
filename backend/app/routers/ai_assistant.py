from fastapi import APIRouter, Depends
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import process_chat
from app.services.dependencies import get_current_user
from app.mongodb import get_mongo_db

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, current_user=Depends(get_current_user)):
    history = [{"role": msg.role, "content": msg.content} for msg in payload.conversation_history]
    mongo = get_mongo_db()
    result = await process_chat(
        user_message=payload.message,
        conversation_history=history,
        user_id=current_user.id,
        mongo=mongo,
    )
    return ChatResponse(response=result["response"], restaurants=result["restaurants"], filters_used=result["filters_used"])
