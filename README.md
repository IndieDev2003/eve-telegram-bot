# Eve Telegram Agent with Gmail & Cloudflare Workers AI

Eve is a personal AI assistant built using **Vercel's [Eve](https://github.com/vercel/eve) Agent Framework**, powered by **Cloudflare Workers AI** (Llama 3.3 70B Instruct), communicating via **Telegram**, and capable of sending emails through **Gmail**.

---

## 🌟 Key Features

- **Filesystem-First Agent Architecture**: Built natively on the `eve` framework (`agent/` layout with `agent.ts`, `instructions.md`, `channels/`, and `tools/`).
- **Cloudflare Workers AI**: Powered by `@cf/meta/llama-3.3-70b-instruct` (or customizable model) via Cloudflare's OpenAI-compatible REST API / AI Gateway.
- **Telegram Channel**: Uses Eve's native `telegramChannel` with webhook authentication (`X-Telegram-Bot-Api-Secret-Token`), typing indicators, and session continuity.
- **Gmail Integration**: Full email dispatch capability (`send_gmail`) with rich text/HTML support, CC, BCC, and connection diagnostics (`check_gmail_status`).
- **Human-in-the-Loop (HITL) Approval (Optional)**: Can pause and present interactive Telegram inline-keyboard buttons (`[Approve] / [Deny]`) before dispatching emails.

---

## 📁 Project Structure

```text
e:/eve/
├── agent/
│   ├── agent.ts                   # Agent definition and Cloudflare Workers AI model config
│   ├── instructions.md            # System prompt and behavioral instructions for Eve
│   ├── channels/
│   │   └── telegram.ts            # Telegram Bot Channel (/eve/v1/telegram)
│   ├── lib/
│   │   ├── cloudflare-ai.ts       # Cloudflare Workers AI client via @ai-sdk/openai
│   │   └── gmail.ts               # Gmail SMTP transporter and mail sender
│   └── tools/
│       ├── send_gmail.ts          # Tool: Send emails with optional HITL confirmation
│       └── check_gmail_status.ts  # Tool: Test Gmail SMTP connectivity
├── scripts/
│   ├── set-webhook.ts             # Manage Telegram webhooks (set, check, delete)
│   ├── test-cf-ai.ts              # Diagnostic CLI test for Cloudflare Workers AI
│   └── test-gmail.ts              # Diagnostic CLI test for Gmail SMTP credentials
├── .env.example                   # Environment variables template
├── .env                           # Local environment configuration (secret)
├── package.json                   # Dependencies and npm scripts
└── tsconfig.json                  # TypeScript compiler options
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Node.js**: v20+ or v24+
- **pnpm**: `pnpm -v` (installed)
- **Cloudflare Account**: [dash.cloudflare.com](https://dash.cloudflare.com)
- **Telegram Account**: To create a bot via [@BotFather](https://t.me/BotFather)
- **Gmail Account**: With 2-Step Verification enabled

---

### 2. Configure Credentials (`.env`)

Copy `.env.example` to `.env` (already done) and configure the following variables:

```bash
# ------------------------------------------
# 1. Cloudflare Workers AI
# ------------------------------------------
# Cloudflare Dashboard -> Copy Account ID from the right sidebar or URL
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Cloudflare Dashboard -> My Profile -> API Tokens -> Create Token -> "Workers AI Read/Edit"
CLOUDFLARE_API_TOKEN=your_api_token_here

# Model from Cloudflare Workers AI catalog
CLOUDFLARE_MODEL=@cf/meta/llama-3.3-70b-instruct

# ------------------------------------------
# 2. Telegram Bot
# ------------------------------------------
# Open Telegram, message @BotFather, send /newbot and follow prompts
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ

# Any random secure secret token for webhook verification
TELEGRAM_WEBHOOK_SECRET_TOKEN=my_super_secret_telegram_webhook_token_123

# Your bot username (without @)
TELEGRAM_BOT_USERNAME=my_eve_assistant_bot

# ------------------------------------------
# 3. Gmail Configuration
# ------------------------------------------
GMAIL_USER=your_email@gmail.com
GMAIL_SENDER_NAME=Eve Assistant

# How to generate a Gmail App Password:
# 1. Go to Google Account Security: https://myaccount.google.com/security
# 2. Ensure "2-Step Verification" is turned ON.
# 3. Go to "App Passwords": https://myaccount.google.com/apppasswords
# 4. Create a new password named "Eve Agent"
# 5. Copy the 16-character password below (spaces are automatically stripped):
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# ------------------------------------------
# 4. Optional Settings
# ------------------------------------------
# Set to "true" to require interactive Telegram button approval before sending emails
REQUIRE_EMAIL_CONFIRMATION=false
PORT=3000
```

---

### 3. Verify Credentials with Diagnostic Scripts

Before launching the bot, verify your credentials directly from the command line:

#### Test Cloudflare Workers AI:
```bash
pnpm run test:ai
```
*Expected: Sends a test prompt to Cloudflare Workers AI and prints the greeting response.*

#### Test Gmail SMTP Connectivity:
```bash
pnpm run test:gmail
```
*Expected: Connects to `smtp.gmail.com:465` and verifies your App Password.*

To send an actual test email:
```bash
pnpm run test:gmail recipient@example.com
```

---

### 4. Run the Eve Agent

#### Local Development Server:
```bash
pnpm run dev
```
Starts the Eve runtime in development mode with live reloading and diagnostic logging.

#### Production Build & Serve:
```bash
pnpm run build
pnpm run start
```
The server will start listening on port `3000` (or your `$PORT`), mounting the Telegram webhook at:
`http://localhost:3000/eve/v1/telegram`

---

### 5. Expose & Register Telegram Webhook

Telegram requires a publicly reachable **HTTPS** endpoint to deliver incoming updates.

#### For Local Development:
You can use **Cloudflare Tunnel** (recommended) or **ngrok**:

```bash
# Option A: Cloudflare Tunnel (free, no sign-up required)
npx cloudflared tunnel --url http://localhost:3000

# Option B: ngrok
npx ngrok http 3000
```

This will give you a public HTTPS URL (e.g. `https://xxxx.trycloudflare.com`).

#### Register the Webhook with Telegram:
Run the built-in webhook configuration script:

```bash
pnpm run set-webhook https://xxxx.trycloudflare.com/eve/v1/telegram
```

Check webhook status anytime:
```bash
pnpm run set-webhook --info
```

---

## 🐳 Docker Deployment

You can deploy the agent using Docker or Docker Compose.

### Option 1: Using Docker Compose (Recommended)

1. Ensure your `.env` file has your credentials configured.
2. Build and launch the container in the background:
   ```bash
   docker compose up -d --build
   ```
3. Check container logs:
   ```bash
   docker compose logs -f
   ```
4. Stop the container:
   ```bash
   docker compose down
   ```

*Note: The `eve_workflow_data` Docker volume preserves all durable session states, continuations, and conversation history across container restarts.*

### Option 2: Using Raw Docker Commands

1. Build the Docker image:
   ```bash
   docker build -t eve-agent .
   ```
2. Run the container:
   ```bash
   docker run -d \
     --name eve-agent \
     --env-file .env \
     -p 3000:3000 \
     -v eve-data:/app/.eve/.workflow-data \
     --restart unless-stopped \
     eve-agent
   ```

---

## 💬 Interacting with Eve on Telegram

Once the webhook is connected:
1. Open your bot in Telegram (search for `@your_bot_username` or click its link).
2. Send `/start` or send a natural language prompt:
   - *"Hey Eve, are you connected to my Gmail?"*
   - *"Send an email to alex@example.com saying the project proposal is approved and we start on Monday."*
   - *"Email my colleague sarah@example.com with the subject 'Meeting Notes' and summarize the action points: 1) Deploy agent, 2) Test Telegram webhook."*
3. If `REQUIRE_EMAIL_CONFIRMATION=true`, Eve will pause and present an interactive **Approve** button in Telegram before dispatching the email!
4. Once sent, Eve will send you a confirmation with the recipient and timestamp.

