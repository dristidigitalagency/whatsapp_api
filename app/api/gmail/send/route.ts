import { NextResponse } from "next/server";
import { sendGmailMessage } from "../../../../lib/gmail";

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    const result = await sendGmailMessage({ to, subject, text, html });

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({
        error: result.error,
        details: result.details
      }, { status: 500 });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      error: "Failed to send email",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}