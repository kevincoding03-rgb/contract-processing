import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase = None

if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://your-project.supabase.co" and SUPABASE_KEY.startswith("eyJ"):
    try:
        from supabase import create_client, Client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[Supabase] 连接失败: {e}")
        supabase = None


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
