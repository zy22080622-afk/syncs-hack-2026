"""
TL Note — backend

很薄的一层：只处理 LLM 相关的两件事。
已收录词的匹配、搜索、分类全部在前端本地完成，所以这个服务挂了、
或者现场断网，网站的主流程依然可以完整演示。

启动：
    pip install -r requirements.txt
    cp .env.example .env   # 填 API key
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import json
import os
from typing import Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

# DEMO_MODE=1 时完全不走网络，只从 fixtures.json 里取预先跑好的结果。
# 上台演示前打开它，API 挂掉也不会翻车。
DEMO_MODE = os.getenv("DEMO_MODE", "0") == "1"

app = FastAPI(title="TL Note API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon 期间图省事；上线要改成具体域名
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- 数据模型

class LangText(BaseModel):
    en: str = ""
    zh: str = ""
    ja: str = ""


class Explanation(BaseModel):
    simple: LangText = Field(default_factory=LangText)
    full: LangText = Field(default_factory=LangText)


class TermDraft(BaseModel):
    """和前端 terms.json 的字段保持一致，方便人工审核后直接粘进词库。"""

    term: str
    reading: str = ""
    source_language: str = "zh"          # ja | zh | en | ko
    machine_translation: str = ""        # 机翻会给出的字面答案
    real_meaning: LangText = Field(default_factory=LangText)
    explanation: Explanation = Field(default_factory=Explanation)
    category: str = "slang"              # fandom|shipping|character|creation|gaming|slang
    tags: List[str] = []
    sensitivity: str = "safe"            # safe | mild | adult
    confidence: str = "medium"           # high | medium | low
    status: str = "ai-draft"             # 永远是草稿，不允许直接进词库


class DraftRequest(BaseModel):
    term: str
    context: str = ""


class DecodeRequest(BaseModel):
    text: str
    known: List[str] = []


class DecodeResponse(BaseModel):
    terms: List[TermDraft] = []


# ---------------------------------------------------------------- prompt

SYSTEM = """You explain ACG (anime / comic / game) fandom slang to outsiders.

Your readers are: people new to fandom, parents who cannot read their child's posts,
and fans who do not speak the term's source language.

Rules, in order of importance:
1. Output ONLY a JSON object matching the schema you are given. No prose, no markdown fences.
2. Never invent. If you do not actually know a term, set confidence to "low" and say plainly
   in real_meaning that the meaning is uncertain. A wrong confident answer is worse than
   admitting uncertainty.
3. machine_translation must be what a literal machine translator would output — the
   misleading surface reading. This is the contrast the site is built on.
4. explanation.simple must not use any other slang to explain slang. Short sentences.
   Assume the reader is 60 years old and has never used the platform.
5. explanation.full may cover origin, drift, and the edges of correct usage.
6. Fill all three languages (en / zh / ja) for real_meaning and explanation.
7. sensitivity: "adult" if the term is primarily about explicit sexual content,
   "mild" if it needs care to explain, otherwise "safe".
8. Do not moralise and do not warn the reader about fandom. Describe usage as it is."""

DRAFT_SCHEMA = """{
  "term": string,
  "reading": string,
  "source_language": "ja" | "zh" | "en" | "ko",
  "machine_translation": string,
  "real_meaning": { "en": string, "zh": string, "ja": string },
  "explanation": {
    "simple": { "en": string, "zh": string, "ja": string },
    "full":   { "en": string, "zh": string, "ja": string }
  },
  "category": "fandom" | "shipping" | "character" | "creation" | "gaming" | "slang",
  "tags": string[],
  "sensitivity": "safe" | "mild" | "adult",
  "confidence": "high" | "medium" | "low"
}"""


def draft_prompt(term: str, context: str) -> str:
    ctx = f'\n\nIt appeared in this text, use it for context only:\n"""{context[:800]}"""' if context else ""
    return (
        f'Write a TL Note entry for the fandom term: {term}{ctx}\n\n'
        f"Return exactly one JSON object with this shape:\n{DRAFT_SCHEMA}"
    )


def decode_prompt(text: str, known: List[str]) -> str:
    known_str = ", ".join(known[:400])
    return (
        "Here is a message from an online fandom space:\n"
        f'"""{text[:1500]}"""\n\n'
        "These terms are already covered by our wiki, so IGNORE them completely:\n"
        f"{known_str}\n\n"
        "Find any REMAINING words or phrases in the message that are fandom / internet slang "
        "an outsider would not understand. Ignore ordinary vocabulary. If there are none, "
        'return {"terms": []}.\n\n'
        'Return exactly one JSON object: {"terms": [ ... ]} where each element has this shape:\n'
        f"{DRAFT_SCHEMA}"
    )


# ---------------------------------------------------------------- LLM 调用

async def call_llm(prompt: str) -> dict:
    if PROVIDER == "anthropic":
        if not ANTHROPIC_KEY:
            raise HTTPException(503, "ANTHROPIC_API_KEY not set")
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": ANTHROPIC_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": ANTHROPIC_MODEL,
            "max_tokens": 2000,
            "temperature": 0.2,
            "system": SYSTEM,
            "messages": [{"role": "user", "content": prompt}],
        }
        async with httpx.AsyncClient(timeout=45) as client:
            r = await client.post(url, headers=headers, json=payload)
        if r.status_code >= 400:
            raise HTTPException(502, f"LLM error {r.status_code}: {r.text[:300]}")
        raw = r.json()["content"][0]["text"]
    else:
        if not OPENAI_KEY:
            raise HTTPException(503, "OPENAI_API_KEY not set")
        url = f"{OPENAI_BASE}/chat/completions"
        headers = {"Authorization": f"Bearer {OPENAI_KEY}", "content-type": "application/json"}
        payload = {
            "model": OPENAI_MODEL,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": prompt},
            ],
        }
        async with httpx.AsyncClient(timeout=45) as client:
            r = await client.post(url, headers=headers, json=payload)
        if r.status_code >= 400:
            raise HTTPException(502, f"LLM error {r.status_code}: {r.text[:300]}")
        raw = r.json()["choices"][0]["message"]["content"]

    return parse_json(raw)


def parse_json(raw: str) -> dict:
    """模型偶尔会包 markdown 代码块或加一句废话，这里做兜底提取。"""
    s = raw.strip()
    if s.startswith("```"):
        s = s.split("```")[1]
        if s.startswith("json"):
            s = s[4:]
        s = s.strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        start, end = s.find("{"), s.rfind("}")
        if start != -1 and end > start:
            return json.loads(s[start : end + 1])
        raise HTTPException(502, "LLM did not return valid JSON")


# ---------------------------------------------------------------- fixtures

_FIXTURES: Optional[Dict[str, dict]] = None


def fixtures() -> Dict[str, dict]:
    global _FIXTURES
    if _FIXTURES is None:
        path = os.path.join(os.path.dirname(__file__), "fixtures.json")
        try:
            with open(path, encoding="utf-8") as f:
                _FIXTURES = json.load(f)
        except FileNotFoundError:
            _FIXTURES = {}
    return _FIXTURES


# ---------------------------------------------------------------- 路由

@app.get("/api/health")
async def health():
    return {"ok": True, "provider": PROVIDER, "demo_mode": DEMO_MODE}


@app.post("/api/draft", response_model=TermDraft)
async def draft(req: DraftRequest):
    key = req.term.strip()
    if not key:
        raise HTTPException(400, "term is required")

    cached = fixtures().get("draft", {}).get(key)
    if DEMO_MODE:
        if cached:
            return TermDraft(**cached)
        raise HTTPException(503, "DEMO_MODE is on and this term is not in fixtures.json")

    try:
        data = await call_llm(draft_prompt(key, req.context))
    except HTTPException:
        if cached:  # 线上挂了还有缓存兜底
            return TermDraft(**cached)
        raise

    data.setdefault("term", key)
    data["status"] = "ai-draft"  # 永远不允许模型自己声称已审核
    return TermDraft(**data)


@app.post("/api/decode", response_model=DecodeResponse)
async def decode(req: DecodeRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "text is required")

    cached = fixtures().get("decode", {}).get(text)
    if DEMO_MODE:
        if cached:
            return DecodeResponse(**cached)
        return DecodeResponse(terms=[])

    try:
        data = await call_llm(decode_prompt(text, req.known))
    except HTTPException:
        if cached:
            return DecodeResponse(**cached)
        raise

    out: List[TermDraft] = []
    for item in data.get("terms", [])[:8]:
        item["status"] = "ai-draft"
        try:
            out.append(TermDraft(**item))
        except Exception:
            continue  # 单条不合 schema 就丢掉，不要让整个请求失败
    return DecodeResponse(terms=out)
