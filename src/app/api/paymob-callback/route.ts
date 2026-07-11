import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// The correct production domain — hardcoded to avoid env var misconfiguration issues
const PRODUCTION_URL = 'https://scent-house-nine.vercel.app';

export async function GET(req: NextRequest) {
  console.log('[Paymob Callback GET] Redirect callback received.');
  try {
    const { searchParams } = new URL(req.url);
    const success = searchParams.get('success');
    const merchantOrderId = searchParams.get('merchant_order_id');
    const orderId = searchParams.get('order'); // Paymob order ID fallback
    const txnId = searchParams.get('id'); // Paymob transaction ID

    console.log(`[Paymob Callback GET] Redirect details: success=${success}, merchant_order_id=${merchantOrderId}, order=${orderId}, transaction=${txnId}`);

    const baseUrl = PRODUCTION_URL;

    if (success === 'true' && merchantOrderId) {
      console.log(`[Paymob Callback GET] Payment succeeded! Redirecting to confirmation for ${merchantOrderId}`);
      return NextResponse.redirect(`${baseUrl}/confirmation?orderId=${merchantOrderId}&success=true&txn=${txnId}`);
    } else {
      console.warn(`[Paymob Callback GET] Payment failed or details missing. Redirecting to checkout.`);
      return NextResponse.redirect(`${baseUrl}/checkout?error=paymob_failed`);
    }
  } catch (err: any) {
    console.error('[Paymob Callback GET] Callback router crashed:', err.message);
    return NextResponse.redirect(`${PRODUCTION_URL}/checkout?error=paymob_failed`);
  }
}
