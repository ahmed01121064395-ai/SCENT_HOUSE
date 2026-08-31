import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createOrderFromPaymob, logOrderCreationError } from '@/lib/orderCreation';

// Standard HMAC validation for Paymob webhook callbacks
function verifyPaymobHmac(body: any, receivedHmac: string): { isValid: boolean; computedHmac: string } {
  const secret = process.env.PAYMOB_HMAC_SECRET || process.env.NEXT_PUBLIC_PAYMOB_HMAC_SECRET || '2A3A0BECEDD4ACBEE744CEBBB7C2BBB8';
  if (!secret) {
    console.warn('[Paymob Webhook] Missing PAYMOB_HMAC_SECRET. HMAC validation skipped.');
    return { isValid: true, computedHmac: '' };
  }

  try {
    const obj = body.obj;
    if (!obj) return { isValid: false, computedHmac: '' };

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

    const isValid = (computedHmac.toLowerCase() === (receivedHmac || '').toLowerCase());
    return { isValid, computedHmac };
  } catch (err: any) {
    console.error('[Paymob Webhook] Error calculating HMAC:', err.message);
    return { isValid: false, computedHmac: '' };
  }
}

async function logWebhookCall(data: {
  hmac_received: string | null;
  hmac_calculated: string | null;
  hmac_valid: boolean;
  type: string | null;
  payload: any;
  error?: string | null;
}) {
  const logEntry = {
    created_at: new Date().toISOString(),
    hmac_received: data.hmac_received,
    hmac_calculated: data.hmac_calculated,
    hmac_valid: data.hmac_valid,
    type: data.type,
    payload: typeof data.payload === 'object' ? JSON.stringify(data.payload) : String(data.payload),
    error_message: data.error || null
  };

  console.log('[Paymob Webhook Received]', JSON.stringify(logEntry, null, 2));

  try {
    const { error } = await supabase.from('webhook_logs').insert(logEntry);
    if (error) {
      console.warn('[Webhook Logging] Supabase insert note (table might not exist yet):', error.message);
    }
  } catch (err: any) {
    console.error('[Webhook Logging] Error saving to Supabase:', err.message);
  }
}

export async function POST(req: NextRequest) {
  console.log('[Paymob Webhook] Received webhook POST call');

  let rawBody: any = null;
  let receivedHmac: string | null = null;

  try {
    const { searchParams } = new URL(req.url);
    receivedHmac = searchParams.get('hmac') || req.headers.get('hmac') || req.headers.get('x-paymob-hmac');

    try {
      rawBody = await req.json();
    } catch (parseErr: any) {
      await logWebhookCall({
        hmac_received: receivedHmac,
        hmac_calculated: null,
        hmac_valid: false,
        type: 'INVALID_JSON',
        payload: 'Failed to parse JSON body',
        error: parseErr.message
      });
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!receivedHmac) {
      await logWebhookCall({
        hmac_received: null,
        hmac_calculated: null,
        hmac_valid: false,
        type: rawBody?.type || 'UNKNOWN',
        payload: rawBody,
        error: 'Missing hmac signature in query params or headers'
      });
      return NextResponse.json({ error: 'Missing hmac signature' }, { status: 400 });
    }

    // Verify signature
    const { isValid, computedHmac } = verifyPaymobHmac(rawBody, receivedHmac);

    await logWebhookCall({
      hmac_received: receivedHmac,
      hmac_calculated: computedHmac,
      hmac_valid: isValid,
      type: rawBody?.type || 'TRANSACTION',
      payload: rawBody,
      error: isValid ? null : 'HMAC verification mismatch'
    });

    if (!isValid) {
      console.error(`[Paymob Webhook] Signature verification failed. Received: ${receivedHmac} | Computed: ${computedHmac}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const type = rawBody.type; // e.g. TRANSACTION
    const transaction = rawBody.obj;

    if (type === 'TRANSACTION' && transaction) {
      const isSuccess = transaction.success === true || transaction.success === 'true';
      const amount = transaction.amount_cents / 100;
      const currency = transaction.currency;
      
      const paymobOrderId = transaction.order?.id || transaction.order;
      const merchantOrderId = transaction.merchant_order_id || transaction.order?.merchant_order_id || transaction.special_reference;
      const integrationId = Number(transaction.integration_id);

      console.log(`[Paymob Webhook] Transaction ${transaction.id}: Success=${isSuccess}, Amount=${amount} ${currency}, Integration=${integrationId}, PaymobOrder=${paymobOrderId}, MerchantOrder=${merchantOrderId}`);

      if (isSuccess) {
        const orderPayload = transaction.order || {
          id: paymobOrderId,
          merchant_order_id: merchantOrderId,
          amount_cents: transaction.amount_cents,
          shipping_data: transaction.shipping_data || transaction.order?.shipping_data,
          items: transaction.order?.items || [],
          extras: transaction.order?.extras || transaction.extras
        };

        // Trigger dynamic order creation helper
        await createOrderFromPaymob(orderPayload, integrationId);
        console.log(`[Paymob Webhook] Order ${merchantOrderId} processed & inserted successfully via Webhook.`);
      } else {
        console.warn(`[Paymob Webhook] Transaction ${transaction.id} failed. Skipping database insertion.`);
        await logOrderCreationError(merchantOrderId || String(transaction.id), `Paymob transaction failed with code: ${transaction.txn_response_code}`, transaction);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Paymob Webhook] Webhook handler crashed:', err.message);
    if (rawBody) {
      await logWebhookCall({
        hmac_received: receivedHmac,
        hmac_calculated: null,
        hmac_valid: false,
        type: 'CRASH',
        payload: rawBody,
        error: err.message
      });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
