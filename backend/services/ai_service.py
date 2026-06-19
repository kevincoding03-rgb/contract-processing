import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("LEGAL_MODEL_BASE_URL", "http://localhost:11434/v1")
MODEL_NAME = os.getenv("LEGAL_MODEL_NAME", "qwen2.5:3b")
API_KEY = os.getenv("LEGAL_MODEL_API_KEY", "ollama")
VISION_MODEL_NAME = os.getenv("LEGAL_VISION_MODEL_NAME", "minicpm-v4.6:latest")

LEGAL_ANALYSIS_PROMPT = """你是一名专业的中国企业法律顾问，擅长合同审查与风险控制。

请分析以下合同文本：

【合同内容】
{contract_content}

【分析维度】
1. 合同主体资格与履约能力
2. 核心权利义务条款
3. 违约责任与救济条款
4. 争议解决机制
5. 潜在法律风险点

【输出要求】
- 风险等级：高/中/低
- 每个风险点说明：位置、描述、风险等级、建议
- 总结与建议

请用中文输出专业、详细的分析报告。请严格按照以下JSON格式输出：
```json
{{
  "risk_level": "高/中/低",
  "risk_points": [
    {{
      "location": "风险点所在条款位置",
      "description": "风险描述",
      "risk_level": "高/中/低",
      "suggestion": "修改建议"
    }}
  ],
  "summary": "总体总结与建议"
}}
```"""


async def analyze_contract(contract_text: str) -> dict:
    import time
    prompt = LEGAL_ANALYSIS_PROMPT.format(contract_content=contract_text)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1024,
        "stream": False,
        "options": {
            "num_predict": 1024,
        },
    }

    # qwen3 等思考模型关闭深度思考
    if "qwen3" in MODEL_NAME.lower() or "qwq" in MODEL_NAME.lower():
        payload["chat_format"] = "chatml"
        payload.setdefault("options", {})["temperature"] = 0.3

    print(f"[AI] 开始调用模型 {MODEL_NAME}...")
    start_time = time.time()

    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    elapsed = time.time() - start_time
    print(f"[AI] 模型响应完成，耗时 {elapsed:.1f} 秒")

    content = data["choices"][0]["message"]["content"]

    # 尝试从返回内容中提取JSON
    result = _extract_json(content)
    if result is None:
        result = {
            "risk_level": "未知",
            "risk_points": [],
            "summary": content,
            "raw_response": content,
        }

    return result


def _extract_json(text: str) -> dict | None:
    import json
    # 尝试提取 ```json ... ``` 块
    if "```json" in text:
        start = text.index("```json") + 7
        end = text.index("```", start)
        json_str = text[start:end].strip()
    elif "```" in text:
        start = text.index("```") + 3
        end = text.index("```", start)
        json_str = text[start:end].strip()
    elif "{" in text and "}" in text:
        start = text.index("{")
        end = text.rindex("}") + 1
        json_str = text[start:end]
    else:
        return None

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


LEGAL_CHAT_SYSTEM_PROMPT = """你是一名专业的中国企业法律顾问，精通合同法、公司法、劳动法等法律法规。

你的职责：
1. 为用户提供清晰、实用的法律建议
2. 基于事实和法律条文进行分析，不编造法条
3. 指出风险点，给出可操作的修改建议
4. 回答简洁专业，避免过度冗长
5. 涉及诉讼、仲裁等重大事项时提醒用户咨询执业律师

注意：你的回答仅供参考，不构成正式法律意见。重大法律事项请咨询执业律师。"""

OCR_PROMPT = """请识别并提取这张图片中的所有文字内容，保持原有的排版、段落结构和标点符号。

要求：
1. 完整、准确地转录图片中可见的所有文字，不要遗漏、不要总结、不要改写。
2. 保留原文的段落、列表、编号结构。
3. 如果是合同、协议等法律文书，保留条款编号（如第一条、1.1 等）。
4. 只输出识别到的文字内容，不要添加任何解释、说明或注释。
5. 如果图片中没有文字或无法识别，请输出：（未识别到文字内容）"""


async def _vision_ocr(image_content: bytes) -> str:
    """调用视觉模型对单张图片做 OCR，返回识别出的纯文本。

    image_content 应为图片字节；统一按 image/png 提交，
    上游(file_parser)已把图片转成 PNG。
    """
    import time

    b64_image = base64.b64encode(image_content).decode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    payload = {
        "model": VISION_MODEL_NAME,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": OCR_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64_image}"}},
                ],
            }
        ],
        "temperature": 0.1,
        "max_tokens": 2048,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"].strip()


async def analyze_image(image_content: bytes, filename: str) -> dict:
    """单张图片分析：先用视觉模型 OCR 提取文字，再用文本模型做法律分析。"""
    import time

    total_start = time.time()

    # 第一步：视觉模型 OCR 提取文字
    print(f"[AI] 开始调用视觉模型 {VISION_MODEL_NAME} 识别图片 {filename} ...")
    ocr_start = time.time()
    ocr_text = await _vision_ocr(image_content)
    print(f"[AI] OCR 识别完成，耗时 {time.time() - ocr_start:.1f} 秒")

    if not ocr_text or "未识别到文字" in ocr_text:
        return {
            "risk_level": "未知",
            "risk_points": [],
            "summary": "未能从图片中识别到文字内容，请上传更清晰的图片。",
            "raw_response": ocr_text,
        }

    print(f"[AI] OCR 文字长度：{len(ocr_text)} 字符，开始调用 {MODEL_NAME} 进行法律分析...")

    # 第二步：文本模型做法律风险分析
    result = await analyze_contract(ocr_text)

    total_elapsed = time.time() - total_start
    print(f"[AI] 图片分析全流程完成，总耗时 {total_elapsed:.1f} 秒")

    return result


async def analyze_text_and_images(text: str, images: list) -> dict:
    """文档分析：把文档本身的文字 + 内嵌图片的 OCR 文字合并，再交给文本模型做法律分析。

    images: [{'source': str, 'data': bytes}, ...]
    """
    import time

    total_start = time.time()
    all_text_parts = []

    if text.strip():
        all_text_parts.append(text)

    # 对内嵌图片逐张 OCR
    for idx, img in enumerate(images):
        source = img.get("source", f"图片{idx + 1}")
        data = img.get("data")
        if not data:
            continue
        try:
            print(f"[AI] OCR 内嵌图片 {idx + 1}/{len(images)}（来源：{source}）...")
            ocr_start = time.time()
            ocr_text = await _vision_ocr(data)
            print(f"[AI] 内嵌图片 {idx + 1} OCR 完成，耗时 {time.time() - ocr_start:.1f} 秒")
            if ocr_text and "未识别到文字" not in ocr_text:
                all_text_parts.append(f"\n\n【内嵌图片内容 - {source}】\n{ocr_text}")
        except Exception as e:
            # 单张图片 OCR 失败不影响整体流程
            print(f"[AI] 内嵌图片 {idx + 1} OCR 失败: {e}")
            continue

    combined_text = "\n".join(all_text_parts).strip()
    if not combined_text:
        return {
            "risk_level": "未知",
            "risk_points": [],
            "summary": "文档中未提取到任何文字内容（既无正文文字，也未从图片中识别到文字）。",
            "raw_response": "",
        }

    print(f"[AI] 合并后文字总长度：{len(combined_text)} 字符，开始调用 {MODEL_NAME} 进行法律分析...")

    # 把合并后的完整文字交给文本模型分析
    result = await analyze_contract(combined_text)

    total_elapsed = time.time() - total_start
    print(f"[AI] 文档分析全流程完成，总耗时 {total_elapsed:.1f} 秒")

    return result


async def chat(messages: list, context_text: str = "") -> str:
    """多轮对话问答。

    messages: OpenAI 格式的对话历史 [{"role": "user", "content": "..."}, ...]
    context_text: 可选的合同上下文，会拼入 system prompt
    """
    import time

    # 构建 system message（含可选上下文）
    system_content = LEGAL_CHAT_SYSTEM_PROMPT
    if context_text and context_text.strip():
        system_content += f"\n\n以下是用户提供的合同原文，请基于它回答问题：\n{context_text}"

    # 前端传来的 messages 通常只有 user/assistant，我们插入 system
    full_messages = [{"role": "system", "content": system_content}] + messages

    print(f"[AI] 开始调用模型 {MODEL_NAME} 进行对话...")
    start_time = time.time()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    payload = {
        "model": MODEL_NAME,
        "messages": full_messages,
        "temperature": 0.5,
        "max_tokens": 2048,
        "stream": False,
        "options": {
            "num_predict": 2048,
        },
    }

    # qwen3 等思考模型关闭深度思考
    if "qwen3" in MODEL_NAME.lower() or "qwq" in MODEL_NAME.lower():
        payload["chat_format"] = "chatml"
        payload.setdefault("options", {})["temperature"] = 0.5

    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    elapsed = time.time() - start_time
    print(f"[AI] 对话完成，耗时 {elapsed:.1f} 秒")

    return data["choices"][0]["message"]["content"]
