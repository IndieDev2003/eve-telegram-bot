import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import "dotenv/config";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  to: string | string[];
  subject: string;
  accepted: string[];
  rejected: string[];
  timestamp: string;
}

/**
 * Creates and configures the Nodemailer transporter for Gmail.
 * Supports:
 * 1. Gmail App Password (recommended, simplest and most reliable for personal bots)
 * 2. OAuth2 credentials
 */
export function createGmailTransporter(): Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!user) {
    throw new Error(
      "GMAIL_USER environment variable is not defined. Please set GMAIL_USER (e.g. yourname@gmail.com) in your .env file."
    );
  }

  // Option 1: App Password (SMTP)
  if (pass) {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user,
        pass: pass.replace(/\s+/g, ""), // strip any spaces from copy-pasting Google App Password
      },
    });
  }

  // Option 2: OAuth2
  if (clientId && clientSecret && refreshToken) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  }

  throw new Error(
    "Gmail authentication credentials not configured. Please provide either GMAIL_APP_PASSWORD or (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN) in your .env file."
  );
}

/**
 * Verifies that the Gmail transporter connection is valid.
 */
export async function verifyGmailConnection(): Promise<{ ok: boolean; message: string; user?: string }> {
  try {
    const user = process.env.GMAIL_USER;
    const transporter = createGmailTransporter();
    await transporter.verify();
    return {
      ok: true,
      message: `Gmail connection verified successfully for ${user}`,
      user,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: `Failed to connect to Gmail: ${error?.message || String(error)}`,
    };
  }
}

/**
 * Sends an email using Gmail.
 */
export async function sendGmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const transporter = createGmailTransporter();
  const fromUser = process.env.GMAIL_USER;
  const fromName = process.env.GMAIL_SENDER_NAME || "Eve Assistant";

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"${fromName}" <${fromUser}>`,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    text: options.body,
    html: options.html || undefined,
    cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(", ") : options.cc) : undefined,
    bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc) : undefined,
    replyTo: options.replyTo || undefined,
  };

  const info = await transporter.sendMail(mailOptions);

  return {
    success: true,
    messageId: info.messageId,
    to: options.to,
    subject: options.subject,
    accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [],
    rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : [],
    timestamp: new Date().toISOString(),
  };
}
