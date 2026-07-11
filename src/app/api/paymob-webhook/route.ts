import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

function verifyPaymobHmac(body: any, receivedHmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET || process.env.NEXT_PUBLIC_PAYMOB_HMAC_SECRET;
  if (!secret) {
    console.warn('[Paymob Webhook] Missing PAYMOB_HMAC_SECRET. Skipping HMAC validation.');
    return true;
  }
  try {
    const obj = body.obj;
    if (!obj) return false;
    const orderId = obj.order?.id !== undefined ? obj.order.id : (obj.order || '');
    const sourcePan = obj.source_data?.pan !== undefined ? obj.source_data.pan : '';
    const sourceSubType = obj.source_data?.sub_type !== undefined ? obj.source_data.sub_type : '';
    const sourceType = obj.source_data?.type !== undefined ? obj.source_data.type : '';
    const hmacSource = [
      obj.amount_cents, obj.created_at, obj.currency, obj.error_occured,
      obj.has_parent_transaction, obj.id, obj.integration_id, obj.is_3d_secure,
      obj.is_auth, obj.is_capture, obj.is_refunded, obj.is_standalone_payment,
      obj.is_voided, orderId, obj.owner, obj.pending, sourcePan,
      sourceSubType, sourceType, obj.success
    ].join('');
    const computedHmac = crypto.createHmac('sha512', secret).update(hmacSource).digest('hex');
    return computedHmac === receivedHmac;
  } catch (err: any) {
    console.error('[Paymob Webhook] HMAC error:', err.message);
    return false;
  }
}

export async function POST(req: NextRequest) {
  console.log('[Paymob Webhook] Received webhook call');
  try {
    const { searchParams } = new URL(req.url);
    const hmac = searchParams.get('hmac');
    if (!hmac) return NextResponse.json({ error: 'Missing hmac signature' }, { status: 400 });

    const body = await req.json();
    console.log('[Paymob Webhook] Body type:', body.type, '| Transaction ID:', body.obj?.id);

    const isValid = verifyPaymobHmac(body, hmac);
    if (!isValid) {
      console.error('[Paymob Webhook] Invalid HMAC signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const type = body.type;
    const transaction = body.obj;

    if (type === 'TRANSACTION' && transaction) {
      const isSuccess = transaction.success === true || transaction.success === 'true';
      const merchantOrderId = transaction.merchant_order_id;
      const integrationId = Number(transaction.integration_id);

      let paymentLabel = 'بطاقة بنكية';
      if (integrationId === 5774297) paymentLabel = 'محفظة هاتف محمول';
      else if (integrationId === 5774294) paymentLabel = 'دفع كشك (أمان/مصاري)';

      console.log(`[Paymob Webhook] Transaction ${transaction.id}: Success=${isSuccess}, Integration=${integrationId}, MerchantOrder=${merchantOrderId}`);

      if (isSuccess) {
        // Update the pending order to confirmed/paid
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'جديد',
            paymentMethodLabel: `${paymentLabel} - تم الدفع`
          })
          .eq('orderId', merchantOrderId);

        if (error) {
          console.error(`[Paymob Webhook] Failed to update order ${merchantOrderId} to paid:`, error.message);
        } else {
          console.log(`[Paymob Webhook] ✅ Order ${merchantOrderId} marked as PAID successfully!`);
        }
      } else {
        // Keep as ملغي but update the payment label to show it failed
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'ملغي',
            paymentMethodLabel: `${paymentLabel} - فشل الدفع`
          })
          .eq('orderId', merchantOrderId);

        if (error) {
          console.error(`[Paymob Webhook] Failed to update order ${merchantOrderId} to failed:`, error.message);
        } else {
          console.warn(`[Paymob Webhook] ❌ Transaction ${transaction.id} failed. Order ${merchantOrderId} marked as cancelled.`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Paymob Webhook] Crash:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
