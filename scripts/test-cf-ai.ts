import "dotenv/config";
import { generateText } from "ai";
import { getCloudflareModel } from "../agent/lib/cloudflare-ai.ts";

async function main() {
  console.log("==========================================");
  console.log("   Cloudflare Workers AI Connection Test");
  console.log("==========================================");

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const modelId = process.env.CLOUDFLARE_MODEL || "@cf/meta/llama-3.3-70b-instruct";

  console.log(`Account ID: ${accountId ? accountId.slice(0, 6) + "..." : "(not set)"}`);
  console.log(`API Token : ${token ? "••••••••" + token.slice(-4) : "(not set)"}`);
  console.log(`Model     : ${modelId}`);

  if (!accountId || !token) {
    console.error("\n❌ CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing in .env.");
    console.error("Please configure your Cloudflare credentials in .env");
    process.exit(1);
  }

  console.log("\nTesting text generation with Cloudflare Workers AI...");
  const model = getCloudflareModel(modelId);

  try {
    const { text } = await generateText({
      model,
      prompt: "Respond with a single short greeting confirming you are Eve powered by Cloudflare Workers AI.",
    });

    console.log("\n✅ Response received from Cloudflare Workers AI:");
    console.log("--------------------------------------------------");
    console.log(text.trim());
    console.log("--------------------------------------------------");
  } catch (error: any) {
    console.error("\n❌ Cloudflare Workers AI test failed:");
    console.error(error?.message || error);
  }
}

main().catch(console.error);
