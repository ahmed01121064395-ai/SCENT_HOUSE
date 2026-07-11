import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('[Paymob Callback GET] Redirect callback received.');
  try {
    const { searchParams } = new URL(req.url);
    const success = searchParams.get('success');
    const merchantOrderId = searchParams.get('merchant_order_id');
    const orderId = searchParams.get('order'); // Paymob order ID fallback
    const txnId = searchParams.get('id'); // Paymob transaction ID

    console.log(`[Paymob Callback GET] Redirect details: success=${success}, merchant_order_id=${merchantOrderId}, order=${orderId}, transaction=${txnId}`);

    // Read the app base URL from environment variables, fallback to window origin on client or standard domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scent-house-scenthouse0.vercel.app';

    if (success === 'true' && merchantOrderId) {
      console.log(`[Paymob Callback GET] Payment succeeded! Redirecting to confirmation for ${merchantOrderId}`);
      return NextResponse.redirect(`${baseUrl}/confirmation?orderId=${merchantOrderId}&success=true&txn=${txnId}`);
    } else {
      console.warn(`[Paymob Callback GET] Payment failed or details missing. Redirecting to checkout.`);
      return NextResponse.redirect(`${baseUrl}/checkout?error=paymob_failed`);
    }
  } catch (err: any) {
    console.error('[Paymob Callback GET] Callback router crashed:', err.message);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scent-house-scenthouse0.vercel.app';
    return NextResponse.redirect(`${baseUrl}/checkout?error=paymob_failed`);
  }
}
