import { NextResponse } from "next/server";
import axios from "axios";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!WHATSAPP_TOKEN) {
      return NextResponse.json({
        error: "WHATSAPP_ACCESS_TOKEN environment variable is not set"
      }, { status: 500 });
    }

    if (!PHONE_NUMBER_ID) {
      return NextResponse.json({
        error: "WHATSAPP_PHONE_NUMBER_ID environment variable is not set"
      }, { status: 500 });
    }

    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message' field" }, { status: 400 });
    }

    // Validate phone number format (basic check)
    if (!/^\d{10,15}$/.test(to)) {
      return NextResponse.json({
        error: "Invalid phone number format. Use international format without + (e.g., 1234567890)"
      }, { status: 400 });
    }

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("WhatsApp API Error:", error.response?.data || error.message);

    // Handle Axios errors specifically
    if (error.response) {
      const status = error.response.status;
      const fbError = error.response.data?.error;

      if (status === 403) {
        return NextResponse.json({
          error: "Access denied. Please check your WhatsApp Business API token and permissions.",
          details: fbError?.message || "Token may be expired or invalid",
          code: fbError?.code,
          type: fbError?.type
        }, { status: 403 });
      }

      if (status === 401) {
        return NextResponse.json({
          error: "Unauthorized. Invalid access token.",
          details: fbError?.message
        }, { status: 401 });
      }

      if (status === 400) {
        return NextResponse.json({
          error: "Bad request. Please check the phone number format and message content.",
          details: fbError?.message
        }, { status: 400 });
      }

      return NextResponse.json({
        error: `WhatsApp API error (${status})`,
        details: fbError?.message || error.message
      }, { status: status });
    }

    // Handle network/other errors
    return NextResponse.json({
      error: "Failed to send message",
      details: error.message
    }, { status: 500 });
  }
}