# Telegram assistant agent

A Telegram bot that, for you only, can:

- summarize your unread Gmail
- find files in Google Drive
- draft emails (saved in Gmail Drafts, never sent, and only after you tap Yes)

It uses Claude through the Anthropic API. It runs on your own computer.

## Setup (about 20 minutes)

### 1. Install Python packages
Needs Python 3.10 or newer.

    cd telegram-agent
    python -m venv .venv
    source .venv/bin/activate        # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    cp .env.example .env             # then fill in .env as below

### 2. Anthropic API key
1. Go to https://console.anthropic.com and sign in.
2. Add a few dollars of credit under Billing.
3. Create a key under API Keys and paste it into `.env` as `ANTHROPIC_API_KEY`.

### 3. Telegram bot
1. In Telegram, open @BotFather, send `/newbot`, and follow the prompts.
2. Paste the token it gives you into `.env` as `TELEGRAM_BOT_TOKEN`.
3. Open @userinfobot, send any message, and paste your numeric id into `.env` as `TELEGRAM_OWNER_ID`.
   The bot ignores everyone else.

### 4. Google access (Gmail and Drive)
1. Go to https://console.cloud.google.com and create a project.
2. APIs and Services > Library: enable **Gmail API** and **Google Drive API**.
3. APIs and Services > OAuth consent screen: choose External, fill in the basics,
   and add your own Gmail address under **Test users**.
4. Credentials > Create credentials > OAuth client ID > type **Desktop app**.
   Download the JSON and save it in this folder as `credentials.json`.
5. Run `python google_auth.py`. A browser opens; sign in and allow access.
   It saves `token.json`. (Google may warn the app is unverified; that is normal for your own test app.)

### 5. Run it
    python bot.py

Message your bot on Telegram, for example:

- "Summarize my unread emails"
- "Find the file about the Q3 budget"
- "Draft an email to sam@example.com asking to move our meeting to Friday"

## Files
- `bot.py`: Telegram side, including the Yes/No approval buttons
- `agent.py`: the Claude loop and tool list
- `google_tools.py`: Gmail and Drive functions
- `google_auth.py`: Google login

`.env`, `credentials.json` and `token.json` are secrets and are git-ignored. Never share them.
