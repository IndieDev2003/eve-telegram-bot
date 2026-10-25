import { telegramChannel } from "eve/channels/telegram";
import "dotenv/config";

/**
 * Telegram Channel Configuration for Eve Agent.
 *
 * This channel:
 * 1. Mounts the webhook endpoint at POST /eve/v1/telegram
 * 2. Authenticates incoming webhook updates using TELEGRAM_WEBHOOK_SECRET_TOKEN
 * 3. Delivers replies and typing indicators to Telegram chats via TELEGRAM_BOT_TOKEN
 * 4. Supports Human-in-the-loop (HITL) inline-keyboard approval buttons
 * 5. Handles private messages directly, and group mentions via botUsername
 */
export default telegramChannel({
  botUsername: process.env.TELEGRAM_BOT_USERNAME || undefined,
  uploadPolicy: {
    allowedMediaTypes: ["image/*", "application/pdf", "text/*"],
    maxBytes: 15 * 1024 * 1024, // 15MB max file upload
  },
});
