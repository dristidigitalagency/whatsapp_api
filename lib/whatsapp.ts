import axios from "axios";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN as string;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

export interface WhatsAppMessage {
  to: string;
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  details?: string;
  code?: string;
  type?: string;
}

export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    // Validate environment variables
    if (!WHATSAPP_TOKEN) {
      throw new Error("WHATSAPP_ACCESS_TOKEN environment variable is not set");
    }

    if (!PHONE_NUMBER_ID) {
      throw new Error("WHATSAPP_PHONE_NUMBER_ID environment variable is not set");
    }

    if (!to || !message) {
      throw new Error("Missing 'to' or 'message' field");
    }

    // Validate phone number format (basic check)
    if (!/^\d{10,15}$/.test(to)) {
      throw new Error("Invalid phone number format. Use international format without + (e.g., 1234567890)");
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

    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error("WhatsApp API Error:", error);

    // Handle Axios errors specifically
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; data?: { error?: { message?: string; code?: string; type?: string } } } };
      const status = axiosError.response?.status;
      const fbError = axiosError.response?.data?.error;

      if (status === 403) {
        return {
          success: false,
          error: "Access denied. Please check your WhatsApp Business API token and permissions.",
          details: fbError?.message || "Token may be expired or invalid",
          code: fbError?.code,
          type: fbError?.type
        };
      }

      if (status === 401) {
        return {
          success: false,
          error: "Unauthorized. Invalid access token.",
          details: fbError?.message
        };
      }

      if (status === 400) {
        return {
          success: false,
          error: "Bad request. Please check the phone number format and message content.",
          details: fbError?.message
        };
      }

      return {
        success: false,
        error: `WhatsApp API error (${status})`,
        details: fbError?.message || (error instanceof Error ? error.message : 'Unknown error')
      };
    }

    // Handle network/other errors
    return {
      success: false,
      error: "Failed to send message",
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}