import "dotenv/config";

/**
 * Script to manage the Telegram Webhook for the Eve agent.
 *
 * Usage:
 *   node --loader ts-node/esm scripts/set-webhook.ts https://your-domain.com/eve/v1/telegram
 *   or
 *   node scripts/set-webhook.mjs https://your-domain.com/eve/v1/telegram
 *   node scripts/set-webhook.mjs --info
 *   node scripts/set-webhook.mjs --delete
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN;

  if (!token) {
    console.error("❌ Error: TELEGRAM_BOT_TOKEN is not set in your .env file.");
    process.exit(1);
  }

  const arg = process.argv[2];

  if (arg === "--info" || arg === "-i") {
    console.log("🔍 Fetching current Telegram Webhook info...");
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();
    console.log("Webhook Info:", JSON.stringify(data, null, 2));
    return;
  }

  if (arg === "--delete" || arg === "-d") {
    console.log("🗑️ Deleting Telegram Webhook...");
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    const data = await res.json();
    console.log("Result:", data);
    return;
  }

  let webhookUrl = arg;
  if (!webhookUrl) {
    console.error("❌ Usage: pnpm run set-webhook <PUBLIC_HTTPS_URL>");
    console.error("Example: pnpm run set-webhook https://your-app.trycloudflare.com/eve/v1/telegram");
    process.exit(1);
  }

  if (!webhookUrl.startsWith("https://")) {
    console.error("❌ Telegram requires webhooks to use HTTPS.");
    process.exit(1);
  }

  if (!webhookUrl.endsWith("/eve/v1/telegram")) {
    // Append default route if omitted
    webhookUrl = webhookUrl.replace(/\/+$/, "") + "/eve/v1/telegram";
    console.log(`ℹ️ Appended standard endpoint path: ${webhookUrl}`);
  }

  console.log(`Setting Telegram webhook to: ${webhookUrl}`);
  const payload: Record<string, any> = {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
  };

  if (secret) {
    payload.secret_token = secret;
    console.log("🔒 Included secret_token header protection.");
  } else {
    console.warn("⚠️ Warning: TELEGRAM_WEBHOOK_SECRET_TOKEN is not defined in .env. It is highly recommended to secure your webhook.");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (result.ok) {
    console.log("✅ Webhook configured successfully!");
    console.log(result);
  } else {
    console.error("❌ Failed to set webhook:", result);
  }
}

main().catch((err) => {
  console.error("Error executing set-webhook:", err);
  process.exit(1);
});
