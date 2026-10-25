import { defineAgent } from "eve";
import { getCloudflareModel } from "./lib/cloudflare-ai.js";

/**
 * Eve Agent Definition.
 * Uses Cloudflare Workers AI for the language model.
 */
export default defineAgent({
  model: getCloudflareModel(),
  modelContextWindowTokens: 128_000,
  modelOptions: {
    maxTokens: 2000,
    providerOptions: {}
  }
});
