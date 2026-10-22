import crypto from "crypto";

// Midtrans payment gateway integration
// Docs: https://docs.midtrans.com

export interface MidtransItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCustomerDetail {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
}

export interface CreateTransactionPayload {
  orderId: string;
  grossAmount: number;
  items: MidtransItemDetail[];
  customer: MidtransCustomerDetail;
}

export interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
}

const MIDTRANS_BASE_URL = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

const MIDTRANS_API_URL = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://api.midtrans.com/v2"
  : "https://api.sandbox.midtrans.com/v2";

export async function createMidtransTransaction(
  payload: CreateTransactionPayload
): Promise<MidtransTransactionResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || serverKey.includes("xxxxx")) {
    // Development fallback when real keys not yet set
    return {
      token: `demo-snap-token-${Date.now()}`,
      redirect_url: `/checkout/success?order_id=${payload.orderId}`,
    };
  }

  const authString = Buffer.from(`${serverKey}:`).toString("base64");

  const body = {
    transaction_details: {
      order_id: payload.orderId,
      gross_amount: payload.grossAmount,
    },
    item_details: payload.items,
    customer_details: payload.customer,
    credit_card: {
      secure: true,
    },
  };

  const response = await fetch(`${MIDTRANS_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_messages?.[0] ?? "Payment creation failed");
  }

  return response.json();
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === signatureKey;
}

export async function checkMidtransTransactionStatus(orderId: string): Promise<{
  transaction_status?: string;
  payment_type?: string;
  status_code?: string;
  fraud_status?: string;
} | null> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || serverKey.includes("xxxxx")) {
    return null;
  }

  try {
    const authString = Buffer.from(`${serverKey}:`).toString("base64");
    const response = await fetch(`${MIDTRANS_API_URL}/${orderId}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error querying Midtrans transaction status:", error);
    return null;
  }
}
