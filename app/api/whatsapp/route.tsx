import { NextResponse } from "next/server";
import axios from "axios";
import type { NextRequest } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN as string;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

/* =========================
   STEP 1: VERIFY WEBHOOK
========================= */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
}

/* =========================
   TYPES
========================= */
interface WhatsAppMessage {
  from: string;
  text?: {
    body?: string;
  };
}

interface WhatsAppWebhookBody {
  object?: string;
  entry?: {
    changes?: {
      value?: {
        messages?: WhatsAppMessage[];
      };
    }[];
  }[];
}

/* =========================
   STEP 2: HANDLE MESSAGES
========================= */
export async function POST(req: Request) {
  const body: WhatsAppWebhookBody = await req.json();

  console.log("📩 Incoming WhatsApp Message:", JSON.stringify(body, null, 2));

  if (body.object) {
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages ?? [];

    for (const msg of messages) {
      const from = msg.from;
      const text = msg.text?.body;

      if (text) {
        console.log(`💬 Message from ${from}: ${text}`);

        const reply = `Namaste! 🙏 Thank you for contacting Topper Home Tuition.
Please share:
1️⃣ Location  
2️⃣ Student grade  
3️⃣ Preferred subjects  
Or call 980245698 for more info.`;

        try {
          await axios.post(
            `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: from,
              text: { body: reply },
            },
            {
              headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
            },
          );
        } catch (error) {
          console.error("❌ WhatsApp send error:", error);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  }

  return NextResponse.json({ status: "ignored" });
}
