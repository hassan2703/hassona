"""Telegram bot. Run with `python bot.py`."""
import asyncio
import os
import uuid

from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, ContextTypes, MessageHandler, filters

load_dotenv()
import agent  # noqa: E402  (after load_dotenv so the API key is available)

OWNER_ID = int(os.environ["TELEGRAM_OWNER_ID"])
pending: dict[str, asyncio.Future] = {}  # approval id -> future resolved by a button press


async def on_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id != OWNER_ID:
        return  # ignore everyone except the owner
    chat_id = update.effective_chat.id

    async def confirm(summary: str) -> bool:
        key = uuid.uuid4().hex[:8]
        fut = asyncio.get_running_loop().create_future()
        pending[key] = fut
        kb = InlineKeyboardMarkup([[
            InlineKeyboardButton("Yes", callback_data=f"{key}:y"),
            InlineKeyboardButton("No", callback_data=f"{key}:n"),
        ]])
        await ctx.bot.send_message(chat_id, summary[:4000], reply_markup=kb)
        try:
            return await asyncio.wait_for(fut, timeout=300)
        except asyncio.TimeoutError:
            return False
        finally:
            pending.pop(key, None)

    await ctx.bot.send_chat_action(chat_id, "typing")
    try:
        reply = await agent.respond(chat_id, update.message.text, confirm)
    except Exception as e:
        reply = f"Something went wrong: {e}"
    await update.message.reply_text(reply[:4000])


async def on_button(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    if q.from_user.id != OWNER_ID:
        return
    key, choice = q.data.split(":")
    fut = pending.get(key)
    if fut and not fut.done():
        fut.set_result(choice == "y")
    await q.answer()
    await q.edit_message_reply_markup(None)
    await q.message.reply_text("Approved." if choice == "y" else "Cancelled.")


def main():
    app = Application.builder().token(os.environ["TELEGRAM_BOT_TOKEN"]).concurrent_updates(True).build()
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_message))
    app.add_handler(CallbackQueryHandler(on_button))
    print("Bot running. Press Ctrl+C to stop.")
    app.run_polling()


if __name__ == "__main__":
    main()
