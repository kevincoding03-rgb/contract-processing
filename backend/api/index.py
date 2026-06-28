from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from mangum import Mangum
from pydantic import BaseModel
from typing import List, Optional
import httpx

from services.file_parser import parse_file
from services.ai_service import analyze_contract, analyze_image, analyze_text_and_images, chat
from services.supabase_client import save_analysis_record, get_analysis_history, get_analysis_by_id, delete_all_records, supabase

app = FastAPI(title="法律文书智能处理平台 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "法律文书智能处理平台"}


@app.post("/api/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    user_id: str = Form(default="anonymous"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")

    allowed_ext = {"txt", "pdf", "docx", "jpg", "jpeg", "png", "gif", "bmp", "webp"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail=f"不支持的文件格式: .{ext}，仅支持 txt、pdf、docx、jpg、png、gif、bmp、webp")

    image_ext = {"jpg", "jpeg", "png", "gif", "bmp", "webp"}

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件大小不能超过 10MB")

    if ext in image_ext:
        # 图片文件：使用视觉模型直接分析
        try:
            result = await analyze_image(content, file.filename)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"视觉模型请求失败: {e.response.status_code}，请确保已安装视觉模型（如 minicpm-v）")
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"视觉模型连接失败: {str(e)}")
    else:
        # 文档文件：提取文字 + 内嵌图片，再做法律分析
        try:
            parsed = parse_file(file.filename, content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        contract_text = parsed.get("text", "")
        images = parsed.get("images", [])

        if not contract_text.strip() and not images:
            raise HTTPException(status_code=400, detail="文件内容为空（无文字、无图片），无法分析")

        try:
            if images:
                # 有内嵌图片：文字 + 图片 OCR 合并后再分析
                result = await analyze_text_and_images(contract_text, images)
            else:
                # 纯文字文档：直接分析
                result = await analyze_contract(contract_text)
        except httpx.HTTPStatusError as e:
            detail = e.response.text if hasattr(e.response, "text") else e.response.status_code
            raise HTTPException(status_code=502, detail=f"AI 模型请求失败: {detail}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"AI 模型连接失败: {str(e)}")

    # 尝试保存到 Supabase（如果已配置）
    record = None
    try:
        record = save_analysis_record(user_id, file.filename, result)
    except Exception:
        pass  # Supabase 未配置时静默跳过

    return {
        "filename": file.filename,
        "analysis": result,
        "record_id": record["id"] if record else None,
    }


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = ""
    user_id: str = "anonymous"


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """多轮对话问答。前端把完整对话历史发来，后端无状态。"""
    if not req.messages:
        raise HTTPException(status_code=400, detail="消息不能为空")

    # 转成普通 dict 列表交给 ai_service
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    try:
        answer = await chat(messages, context_text=req.context or "")
    except httpx.HTTPStatusError as e:
        detail = e.response.text if hasattr(e.response, "text") else e.response.status_code
        raise HTTPException(status_code=502, detail=f"AI 模型请求失败: {detail}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"AI 模型连接失败: {str(e)}")

    return {"answer": answer}


@app.get("/api/history/{user_id}")
async def history(user_id: str, limit: int = 20):
    try:
        records = get_analysis_history(user_id, limit)
        return {"records": records}
    except (RuntimeError, ValueError) as e:
        return {"records": [], "message": "Supabase 未配置，历史记录功能不可用"}
    except Exception as e:
        if "Supabase" in str(e) or supabase is None:
            return {"records": [], "message": "Supabase 未配置，历史记录功能不可用"}
        raise HTTPException(status_code=500, detail=f"查询历史记录失败: {str(e)}")


@app.get("/api/record/{record_id}")
async def get_record(record_id: str):
    try:
        record = get_analysis_by_id(record_id)
    except (RuntimeError, ValueError):
        raise HTTPException(status_code=503, detail="Supabase 未配置，记录查询功能不可用")
    except Exception as e:
        if "Supabase" in str(e):
            raise HTTPException(status_code=503, detail="Supabase 未配置，记录查询功能不可用")
        raise HTTPException(status_code=500, detail=f"查询记录失败: {str(e)}")
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    return record


@app.delete("/api/clear-history")
async def clear_history():
    """关闭后端前清空所有历史记录。"""
    try:
        count = delete_all_records()
        return {"cleared": count}
    except (RuntimeError, ValueError):
        return {"cleared": 0, "message": "Supabase 未配置，无需清理"}
    except Exception as e:
        if "Supabase" in str(e):
            return {"cleared": 0, "message": "Supabase 未配置，无需清理"}
        raise HTTPException(status_code=500, detail=f"清理失败: {str(e)}")


handler = Mangum(app)
