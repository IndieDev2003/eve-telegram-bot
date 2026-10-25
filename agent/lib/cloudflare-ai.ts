import { createOpenAI } from "@ai-sdk/openai";
import { createAI } from "agents/models/ai-sdk";
import type { LanguageModel } from "ai";
import "dotenv/config";

/**
 * Creates an AI SDK LanguageModel instance backed by Cloudflare Workers AI.
 * 
 * Cloudflare Workers AI provides an OpenAI-compatible REST API at:
 * https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/v1
 * 
 * Or via Cloudflare AI Gateway at:
 * https://gateway.ai.cloudflare.com/v1/{ACCOUNT_ID}/{GATEWAY_ID}/workers-ai/v1
 */
export function getCloudflareModel(
  modelId = process.env.CLOUDFLARE_MODEL || "@cf/meta/llama-3.3-70b-instruct"
): LanguageModel {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const gatewayId = process.env.CLOUDFLARE_GATEWAY_ID;

  if (!accountId || !apiToken) {
    console.warn(
      "[Eve:CloudflareAI] Warning: CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing in environment variables. Please configure your .env file."
    );
  }
 

  const cloudflare = createAI({
    apiToken,
    accountId,
    gateway:gatewayId
  })

  return cloudflare(modelId);
}
