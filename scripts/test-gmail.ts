import "dotenv/config";
import { verifyGmailConnection, sendGmail } from "../agent/lib/gmail.ts";

async function main() {
  console.log("==========================================");
  console.log("   Gmail SMTP & Credentials Test");
  console.log("==========================================");

  const user = process.env.GMAIL_USER;
  console.log(`Configured GMAIL_USER: ${user || "(not set)"}`);

  if (!user) {
    console.error("❌ GMAIL_USER is missing in .env.");
    console.error("Please add GMAIL_USER and GMAIL_APP_PASSWORD to .env");
    process.exit(1);
  }

  console.log("\n1. Verifying SMTP Connection...");
  const verification = await verifyGmailConnection();

  if (!verification.ok) {
    console.error("❌ SMTP Verification Failed:");
    console.error(verification.message);
    process.exit(1);
  }

  console.log("✅", verification.message);

  const recipient = process.argv[2];
  if (recipient) {
    console.log(`\n2. Sending test email to: ${recipient}...`);
    try {
      const result = await sendGmail({
        to: recipient,
        subject: "Eve Agent - Test Email",
        body: `Hello!\n\nThis is a test email sent by your Eve Agent via Gmail SMTP.\nTimestamp: ${new Date().toISOString()}`,
      });
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", result.messageId);
    } catch (err: any) {
      console.error("❌ Failed to send test email:", err.message);
    }
  } else {
    console.log("\n💡 To send an actual test email, pass an address as argument:");
    console.log("   pnpm run test:gmail recipient@example.com");
  }
}

main().catch(console.error);
