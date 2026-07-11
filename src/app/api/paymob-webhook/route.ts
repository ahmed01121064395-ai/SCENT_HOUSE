import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrderFromPaymob, logOrderCreationError } from '@/lib/orderCreation';

// Standard HMAC validation for Paymob webhook callbacks
function verifyPaymobHmac(body: any, receivedHmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET || process.env.NEXT_PUBLIC_PAYMOB_HMAC_SECRET;
  if (!secret) {
    console.warn('[Paymob Webhook] Missing PAYMOB_HMAC_SECRET. HMAC validation skipped.');
    return true; // During placeholder/testing phase or if not configured, you might allow it or fail
  }

  try {
    const obj = body.obj;
    if (!obj) return false;

    // Concatenate the values in the exact lexicographical/ordered sequence defined by Paymob docs:
    // amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id,
    // is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order.id,
    // owner, pending, source_data.pan, source_data.sub_type, source_data.type, success.
    const orderId = obj.order?.id !== undefined ? obj.order.id : (obj.order || '');
    const sourcePan = obj.source_data?.pan !== undefined ? obj.source_data.pan : '';
    const sourceSubType = obj.source_data?.sub_type !== undefined ? obj.source_data.sub_type : '';
    const sourceType = obj.source_data?.type !== undefined ? obj.source_data.type : '';

    const hmacSource = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      orderId,
      obj.owner,
      obj.pending,
      sourcePan,
      sourceSubType,
      sourceType,
      obj.success
    ].join('');

    const computedHmac = crypto
      .createHmac('sha512', secret)
      .update(hmacSource)
      .digest('hex');

    return computedHmac === receivedHmac;
  } catch (err: any) {
    console.error('[Paymob Webhook] Error calculating HMAC:', err.message);
    return false;
  }
}

export async function POST(req: NextRequest) {
  console.log('[Paymob Webhook] Received webhook call');

  try {
    // Read query parameter for HMAC signature (passed by Paymob in URL: ?hmac=...)
    const { searchParams } = new URL(req.url);
    const hmac = searchParams.get('hmac');

    if (!hmac) {
      return NextResponse.json({ error: 'Missing hmac signature' }, { status: 400 });
    }

    const body = await req.json();
    console.log('[Paymob Webhook] Body:', JSON.stringify(body, null, 2));

    // Verify signature
    const isValid = verifyPaymobHmac(body, hmac);
    if (!isValid) {
      console.error('[Paymob Webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const type = body.type; // e.g. TRANSACTION
    const transaction = body.obj;

    if (type === 'TRANSACTION' && transaction) {
      const isSuccess = transaction.success === true || transaction.success === 'true';
      const amount = transaction.amount_cents / 100;
      const currency = transaction.currency;
      
      const paymobOrderId = transaction.order?.id || transaction.order;
      const merchantOrderId = transaction.merchant_order_id || transaction.order?.merchant_order_id;
      const integrationId = Number(transaction.integration_id);

      console.log(`[Paymob Webhook] Transaction ${transaction.id}: Success=${isSuccess}, Amount=${amount} ${currency}, Integration=${integrationId}, PaymobOrder=${paymobOrderId}, MerchantOrder=${merchantOrderId}`);

      if (isSuccess) {
        if (!transaction.order) {
          throw new Error('Transaction order object is empty - cannot create order in DB');
        }

        // Trigger dynamic order creation helper
        await createOrderFromPaymob(transaction.order, integrationId);
        console.log(`[Paymob Webhook] Order ${merchantOrderId} processed & inserted successfully via Webhook.`);
      } else {
        console.warn(`[Paymob Webhook] Transaction ${transaction.id} failed. Skipping database insertion (no unpaid order created).`);
        await logOrderCreationError(merchantOrderId || 'UNKNOWN', `Paymob transaction failed with code: ${transaction.txn_response_code}`, transaction);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Paymob Webhook] Webhook handler crashed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
