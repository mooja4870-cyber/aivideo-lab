declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

const FALLBACK_TOSS_CLIENT_KEY = "test_ck_example_client_key";

export async function loadTossPayments() {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? FALLBACK_TOSS_CLIENT_KEY;
  const module = await import("@tosspayments/tosspayments-sdk");
  return module.loadTossPayments(clientKey);
}

export async function requestPayment(params: {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
}) {
  const toss = (await loadTossPayments()) as unknown as {
    requestPayment?: (method: string, payload: Record<string, unknown>) => Promise<unknown>;
    payment?: (config: { customerKey: string }) => {
      requestPayment: (method: string, payload: Record<string, unknown>) => Promise<unknown>;
    };
  };

  if (toss.requestPayment) {
    return toss.requestPayment("CARD", params);
  }

  if (toss.payment) {
    const payment = toss.payment({ customerKey: params.customerName || "guest" });
    return payment.requestPayment("CARD", params);
  }

  throw new Error("TossPayments SDK is not initialized correctly.");
}
