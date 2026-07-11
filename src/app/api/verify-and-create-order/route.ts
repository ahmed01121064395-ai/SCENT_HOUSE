import { NextRequest, NextResponse } from 'next/server';
import { createOrderFromPaymob } from '@/lib/orderCreation';

export async function POST(req: NextRequest) {
  console.log('[Verify & Create Order API] Received order verification request');

  try {
    const { orderId, txnId } = await req.json();

    if (!orderId || !txnId) {
      return NextResponse.json({ error: 'Missing orderId or txnId' }, { status: 400 });
    }

    const apiKey = process.env.PAYMOB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Paymob API Key configuration' }, { status: 500 });
    }

    // 1. Authenticate with Paymob
    console.log('[Verify & Create Order API] Authenticating with Paymob...');
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    if (!authRes.ok) {
      const errText = await authRes.text();
      return NextResponse.json({ error: `Paymob Authentication failed: ${errText}` }, { status: 400 });
    }
    const { token: authToken } = await authRes.json();

    // 2. Query Transaction Status from Paymob API
    console.log(`[Verify & Create Order API] Fetching transaction ${txnId} from Paymob...`);
    const txRes = await fetch(`https://accept.paymob.com/api/acceptance/transactions/${txnId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!txRes.ok) {
      const errText = await txRes.text();
      console.error(`[Verify & Create Order API] Failed to fetch transaction ${txnId}:`, errText);
      return NextResponse.json({ error: `Failed to fetch transaction from Paymob: ${errText}` }, { status: 400 });
    }

    const transaction = await txRes.json();
    const isSuccess = transaction.success === true || transaction.success === 'true';
    const paymobOrderId = transaction.order?.id || transaction.order;
    const merchantOrderId = transaction.merchant_order_id || transaction.order?.merchant_order_id;
    const integrationId = Number(transaction.integration_id);

    console.log(`[Verify & Create Order API] Paymob Transaction Status: success=${isSuccess}, merchant_order_id=${merchantOrderId}`);

    // Verify security checks
    if (!isSuccess) {
      return NextResponse.json({ error: 'Transaction is not approved by Paymob' }, { status: 400 });
    }

    if (merchantOrderId !== orderId) {
      return NextResponse.json({ error: 'Transaction merchant order ID mismatch' }, { status: 400 });
    }

    if (!transaction.order) {
      return NextResponse.json({ error: 'Order object missing in transaction data' }, { status: 400 });
    }

    // 3. Create the order in database dynamically if it doesn't already exist
    const orderRow = await createOrderFromPaymob(transaction.order, integrationId);
    console.log(`[Verify & Create Order API] Order ${merchantOrderId} verified and processed successfully!`);

    return NextResponse.json({ success: true, orderId: orderRow.orderId });

  } catch (err: any) {
    console.error('[Verify & Create Order API] Crash:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
