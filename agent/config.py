"""Shared configuration — initializes OpenAI and Supabase clients."""

from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

# Load .env from the same directory as this file (agent/)
_agent_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_agent_dir, ".env"), override=True)


@lru_cache
def get_openai_client() -> OpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=api_key)


@lru_cache
def get_paper_supabase() -> Client:
    url = os.environ.get("PAPER_SUPABASE_URL")
    key = os.environ.get("PAPER_SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("PAPER_SUPABASE_URL / PAPER_SUPABASE_SERVICE_ROLE_KEY not set")
    return create_client(url, key)
