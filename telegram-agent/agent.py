"""The agent: Claude plus tools, in a loop."""
import asyncio
import json
from typing import Awaitable, Callable

from anthropic import AsyncAnthropic

import google_tools

MODEL = "claude-sonnet-5-5"
MAX_STEPS = 8

SYSTEM = (
    "You are a personal assistant for one user, talking to them on Telegram. "
    "You can read their unread Gmail, search their Google Drive, and create Gmail drafts. "
    "You can never send email. Keep replies short and plain text (no markdown tables). "
    "When asked to draft an email, call create_draft; the user will be asked to approve it."
)

TOOLS = [
    {
        "name": "list_unread_emails",
        "description": "List unread emails in the inbox (sender, subject, date, snippet).",
        "input_schema": {
            "type": "object",
            "properties": {"max_results": {"type": "integer", "description": "1 to 20, default 10"}},
        },
    },
    {
        "name": "search_drive",
        "description": "Search Google Drive file contents and names for a text query.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}, "max_results": {"type": "integer"}},
            "required": ["query"],
        },
    },
    {
        "name": "create_draft",
        "description": "Create a Gmail draft (does not send). Requires user approval.",
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["to", "subject", "body"],
        },
    },
]

# Tools that change something, so we ask the user before running them.
NEEDS_APPROVAL = {"create_draft"}

Confirm = Callable[[str], Awaitable[bool]]
client = AsyncAnthropic()  # reads ANTHROPIC_API_KEY from the environment
history: dict[int, list[dict]] = {}  # chat_id -> past (user text, assistant text) turns


async def run_tool(name: str, args: dict, confirm: Confirm):
    if name in NEEDS_APPROVAL:
        summary = f"Create this draft?\n\nTo: {args['to']}\nSubject: {args['subject']}\n\n{args['body']}"
        if not await confirm(summary):
            return "The user declined. Nothing was created."
    fn = getattr(google_tools, name)
    return await asyncio.to_thread(fn, **args)


async def respond(chat_id: int, text: str, confirm: Confirm) -> str:
    past = history.setdefault(chat_id, [])
    messages = past[-20:] + [{"role": "user", "content": text}]

    for _ in range(MAX_STEPS):
        resp = await client.messages.create(
            model=MODEL, max_tokens=2000, system=SYSTEM, tools=TOOLS, messages=messages
        )
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":
            break
        results = []
        for block in resp.content:
            if block.type != "tool_use":
                continue
            try:
                out = await run_tool(block.name, block.input, confirm)
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": json.dumps(out, ensure_ascii=False)})
            except Exception as e:  # report the error to Claude so it can explain
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": f"Error: {e}", "is_error": True})
        messages.append({"role": "user", "content": results})

    answer = "".join(b.text for b in resp.content if b.type == "text") or "(no reply)"
    past += [{"role": "user", "content": text}, {"role": "assistant", "content": answer}]
    return answer
