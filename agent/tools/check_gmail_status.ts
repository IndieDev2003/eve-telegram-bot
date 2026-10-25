import { defineTool } from "eve/tools";
import { z } from "zod";
import { verifyGmailConnection } from "../lib/gmail.js";

export default defineTool({
  description:
    "Check and verify whether the Gmail SMTP credentials and connection are currently working. Use this when the user asks if their Gmail is connected or asks to test email connectivity.",
  inputSchema: z.object({}),
  async execute() {
    const result = await verifyGmailConnection();
    return {
      connected: result.ok,
      message: result.message,
      account: result.user || "Not configured",
    };
  },
});
