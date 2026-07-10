/**
 * Pluggable payment methods integration helper.
 * Reads configurations from environment variables.
 */

export interface PaymentCustomerInfo {
  fullname: string;
  email?: string;
  phone: string;
  city: string;
  address: string;
}

/**
 * Initiates Card Payment with Paymob (Visa / MasterCard).
 * Uses process.env.PAYMOB_API_KEY and process.env.PAYMOB_CARD_INTEGRATION_ID.
 */
export async function initiateCardPayment(orderId: string, amount: number, customer: PaymentCustomerInfo): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;

  if (!apiKey || !integrationId) {
    throw new Error('بيانات دمج الدفع بالبطاقة غير مكتملة في البيئة المحيطة (PAYMOB_API_KEY / PAYMOB_CARD_INTEGRATION_ID)');
  }

  // Placeholder logic for Paymob Card checkout redirect
  console.log(`[Card Payment] Initiating checkout for order ${orderId} with amount ${amount}`);
  
  // Later integration steps:
  // 1. POST to https://accept.paymob.com/api/auth/tokens (get auth token)
  // 2. POST to https://accept.paymob.com/api/ecommerce/orders (create Paymob order)
  // 3. POST to https://accept.paymob.com/api/acceptance/payment_keys (generate payment key)
  // 4. Return redirect link to https://accept.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={payment_key}
  
  return `https://accept.paymob.com/api/acceptance/iframes/placeholder?orderId=${orderId}`;
}

/**
 * Initiates Mobile Wallet Payment with Paymob (Vodafone Cash, Orange, etc. - UIG Integration).
 * Uses process.env.PAYMOB_API_KEY and process.env.PAYMOB_WALLET_INTEGRATION_ID.
 */
export async function initiateWalletPayment(
  orderId: string, 
  amount: number, 
  customer: PaymentCustomerInfo,
  walletNumber: string
): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;

  if (!apiKey || !integrationId) {
    throw new Error('بيانات دمج المحفظة الإلكترونية غير مكتملة في البيئة المحيطة (PAYMOB_API_KEY / PAYMOB_WALLET_INTEGRATION_ID)');
  }

  console.log(`[Wallet Payment] Initiating wallet checkout to ${walletNumber} for order ${orderId} with amount ${amount}`);

  // Later integration steps:
  // 1. Generate Acceptance Payment Key (similar to credit card flow above)
  // 2. POST to UIG wallet endpoint: https://accept.paymob.com/api/acceptance/payments/pay
  //    Payload: { source: { identifier: walletNumber, subtype: "WALLET" }, payment_token: paymentToken }
  // 3. Return rediction URL returned by Paymob (e.g. redirect_url)
  
  return `https://accept.paymob.com/api/acceptance/payments/pay/placeholder?orderId=${orderId}`;
}

/**
 * Initiates InstaPay Payment (if gateway supports native integration, or direct bank transfer redirect).
 */
export async function initiateInstaPayPayment(orderId: string, amount: number, customer: PaymentCustomerInfo): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INSTAPAY_INTEGRATION_ID; // Custom identifier if utilizing gateway

  // If you decide to handle InstaPay manually via QR codes / IPA display:
  // This could return a local URL to an instruction/receipt-upload page.
  // If native Paymob support is added later:
  if (!apiKey || !integrationId) {
    throw new Error('بيانات دمج InstaPay غير مكتملة في البيئة المحيطة (PAYMOB_API_KEY / PAYMOB_INSTAPAY_INTEGRATION_ID)');
  }

  console.log(`[InstaPay Payment] Initiating InstaPay checkout for order ${orderId}`);
  return `https://instapay.eg/placeholder-merchant?orderId=${orderId}`;
}

/**
 * Initiates Apple Pay Payment with Paymob.
 * Uses process.env.PAYMOB_API_KEY and process.env.PAYMOB_APPLE_PAY_INTEGRATION_ID.
 */
export async function initiateApplePayPayment(orderId: string, amount: number, customer: PaymentCustomerInfo): Promise<string> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_APPLE_PAY_INTEGRATION_ID;

  if (!apiKey || !integrationId) {
    throw new Error('بيانات دمج Apple Pay غير مكتملة في البيئة المحيطة (PAYMOB_API_KEY / PAYMOB_APPLE_PAY_INTEGRATION_ID)');
  }

  console.log(`[Apple Pay] Initiating Apple Pay checkout for order ${orderId}`);
  return `https://accept.paymob.com/api/acceptance/apple-pay/placeholder?orderId=${orderId}`;
}
