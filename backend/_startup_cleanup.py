"""启动时自动清空云端历史记录。"""
import sys, os, httpx

BASE_URL = "http://localhost:8000"

try:
    resp = httpx.delete(f"{BASE_URL}/api/clear-history", timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        cleared = data.get("cleared", 0)
        print(f"  已清空 {cleared} 条历史记录")
    else:
        print(f"  清空失败: HTTP {resp.status_code}")
except Exception as e:
    print(f"  清空失败（后端未运行: {e}）")
    print("  历史记录将在下次启动时重试清空")
