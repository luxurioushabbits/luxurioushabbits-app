/**
 * Authorize.net Integration — Luxurious Habbits
 * Server-side charge using Accept.js payment nonce.
 * Credentials are read from environment variables:
 *   AUTHORIZE_NET_API_LOGIN_ID  — API Login ID from Authorize.net
 *   AUTHORIZE_NET_TRANSACTION_KEY — Transaction Key from Authorize.net
 *   AUTHORIZE_NET_ENVIRONMENT   — "sandbox" | "production" (default: "production")
 */

interface ChargeResult {
  success: boolean;
  transactionId?: string;
  authCode?: string;
  errorMessage?: string;
  responseCode?: string;
}

interface AuthNetResponse {
  transactionResponse?: {
    responseCode?: string;
    transId?: string;
    authCode?: string;
    errors?: Array<{ errorCode: string; errorText: string }>;
    messages?: Array<{ code: string; description: string }>;
  };
  messages?: {
    resultCode?: string;
    message?: Array<{ code: string; text: string }>;
  };
}

/**
 * Charge a card using an Accept.js payment nonce.
 * The nonce is generated on the frontend by Authorize.net's Accept.js library
 * and passed to the server — card data never touches your server.
 */
export async function chargeCard({
  paymentNonce,
  dataDescriptor,
  amountCents,
  orderNumber,
  customerEmail,
  customerName,
}: {
  paymentNonce: string;
  dataDescriptor: string;
  amountCents: number;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
}): Promise<ChargeResult> {
  const loginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
  const environment = process.env.AUTHORIZE_NET_ENVIRONMENT ?? "production";

  if (!loginId || !transactionKey) {
    return { success: false, errorMessage: "Payment processor not configured. Please contact support." };
  }

  const apiUrl = environment === "sandbox"
    ? "https://apitest.authorize.net/xml/v1/request.api"
    : "https://api.authorize.net/xml/v1/request.api";

  const amountDollars = (amountCents / 100).toFixed(2);

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: loginId,
        transactionKey,
      },
      refId: orderNumber,
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: amountDollars,
        payment: {
          opaqueData: {
            dataDescriptor,
            dataValue: paymentNonce,
          },
        },
        order: {
          invoiceNumber: orderNumber,
          description: "Luxurious Habbits Order",
        },
        customer: {
          email: customerEmail,
        },
        billTo: {
          firstName: customerName.split(" ")[0] ?? customerName,
          lastName: customerName.split(" ").slice(1).join(" ") || customerName,
          email: customerEmail,
        },
      },
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    // Authorize.net sometimes returns a BOM character — strip it
    const cleaned = text.replace(/^\uFEFF/, "");
    const data: AuthNetResponse = JSON.parse(cleaned);

    const txn = data.transactionResponse;
    const resultCode = data.messages?.resultCode;

    if (resultCode === "Ok" && txn?.responseCode === "1") {
      return {
        success: true,
        transactionId: txn.transId,
        authCode: txn.authCode,
      };
    }

    // Extract error message
    const errorMsg =
      txn?.errors?.[0]?.errorText ??
      data.messages?.message?.[0]?.text ??
      "Payment declined. Please check your card details and try again.";

    return { success: false, errorMessage: errorMsg, responseCode: txn?.responseCode };
  } catch (err) {
    console.error("[Authorize.net] Charge error:", err);
    return { success: false, errorMessage: "Payment processing error. Please try again or contact support." };
  }
}

/**
 * Returns true if Authorize.net is configured and ready to accept payments.
 */
export function isAuthNetConfigured(): boolean {
  const loginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
  return !!(loginId && loginId.trim() !== "" && transactionKey && transactionKey.trim() !== "");
}
