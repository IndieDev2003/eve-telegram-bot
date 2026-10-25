import { defineTool } from "eve/tools";
import { always, never } from "eve/tools/approval";
import { z } from "zod";
import { sendGmail } from "../lib/gmail.js";

export default defineTool({
  description:
    "Send an email via Gmail to one or more recipient addresses with a subject and body content. Use this tool whenever the user asks you to send, compose, or dispatch an email.",
  inputSchema: z.object({
    to: z
      .union([z.string(), z.array(z.string())])
      .describe("The recipient email address (e.g. 'friend@example.com') or a list of addresses."),
    subject: z.string().min(1).describe("The subject line of the email."),
    body: z.string().min(1).describe("The plain text content of the email message."),
    html: z.string().optional().describe("Optional rich HTML version of the email body."),
    cc: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe("Optional CC (Carbon Copy) email address or list of addresses."),
    bcc: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .describe("Optional BCC (Blind Carbon Copy) email address or list of addresses."),
    replyTo: z.string().optional().describe("Optional reply-to address."),
  }),
  // Human-in-the-loop approval: Enabled if REQUIRE_EMAIL_CONFIRMATION is set to "true"
  approval:
    process.env.REQUIRE_EMAIL_CONFIRMATION === "true"
      ? {
          request: always(),
          prompt: ({ input }) =>
            `Approve sending email to ${Array.isArray(input.to) ? input.to.join(", ") : input.to} with subject "${input.subject}"?`,
        }
      : never(),
  async execute(input) {
    try {
      const result = await sendGmail({
        to: input.to,
        subject: input.subject,
        body: input.body,
        html: input.html,
        cc: input.cc,
        bcc: input.bcc,
        replyTo: input.replyTo,
      });

      return {
        status: "success",
        messageId: result.messageId,
        recipient: input.to,
        subject: input.subject,
        sentAt: result.timestamp,
        info: "The email has been successfully sent through Gmail.",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to send email: ${error?.message || String(error)}`,
        hint: "Verify that GMAIL_USER and GMAIL_APP_PASSWORD (or OAuth credentials) are configured properly in the .env file.",
      };
    }
  },
});
