import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER as string;
const GMAIL_PASS = process.env.GMAIL_PASS as string;

export interface GmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface GmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: string;
}

export async function sendGmailMessage({ to, subject, text, html }: GmailMessage): Promise<GmailResponse> {
  try {
    // Validate environment variables
    if (!GMAIL_USER) {
      throw new Error("GMAIL_USER environment variable is not set");
    }

    if (!GMAIL_PASS) {
      throw new Error("GMAIL_PASS environment variable is not set");
    }

    if (!to || !subject) {
      throw new Error("Missing 'to' or 'subject' field");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: GMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("Gmail SMTP Error:", error instanceof Error ? error.message : error);

    return {
      success: false,
      error: "Failed to send email",
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}