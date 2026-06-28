import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase = None

# 校验：URL 非空；KEY 非空
_key_ok = bool(SUPABASE_KEY)
_url_ok = bool(SUPABASE_URL)

if _url_ok and _key_ok:
    try:
        from supabase import create_client, Client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[Supabase] 连接成功: {SUPABASE_URL}")
    except Exception as e:
        print(f"[Supabase] 连接失败: {e}")
        supabase = None
else:
    _reason = []
    if not _url_ok:
        _reason.append("SUPABASE_URL 未配置")
    if not _key_ok:
        _reason.append("SUPABASE_KEY 未配置")
    print(f"[Supabase] 未配置 ({', '.join(_reason)})，历史记录功能不可用")


def get_supabase():
    if supabase is None:
        raise RuntimeError("Supabase 未配置，请检查环境变量 SUPABASE_URL 和 SUPABASE_KEY")
    return supabase


def save_analysis_record(user_id: str, filename: str, result: dict) -> dict:
    db = get_supabase()
    response = db.table("analysis_records").insert({
        "user_id": user_id,
        "filename": filename,
        "result": result,
    }).execute()
    return response.data[0]


def get_analysis_history(user_id: str, limit: int = 20) -> list:
    db = get_supabase()
    response = (
        db.table("analysis_records")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return response.data


def get_analysis_by_id(record_id: str) -> dict | None:
    db = get_supabase()
    response = db.table("analysis_records").select("*").eq("id", record_id).execute()
    if response.data:
        return response.data[0]
    return None


def delete_all_records() -> int:
    """删除所有历史记录，返回删除数量。"""
    db = get_supabase()
    # 先查出所有记录的 ID
    response = db.table("analysis_records").select("id").execute()
    ids = [r["id"] for r in response.data]
    if not ids:
        return 0
    # 批量删除
    db.table("analysis_records").delete().in_("id", ids).execute()
    return len(ids)
