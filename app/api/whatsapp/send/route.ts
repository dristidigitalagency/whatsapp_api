import { NextResponse } from "next/server";
import axios from "axios";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message' field" }, { status: 400 });
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
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}