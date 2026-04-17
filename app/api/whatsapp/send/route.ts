import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();

    const result = await sendWhatsAppMessage({ to, message });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      const status = result.code === 'access_denied' ? 403 :
                     result.code === 'unauthorized' ? 401 :
                     result.code === 'bad_request' ? 400 : 500;
      return NextResponse.json({
        error: result.error,
        details: result.details,
        code: result.code,
        type: result.type
      }, { status });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      error: "Failed to send message",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}