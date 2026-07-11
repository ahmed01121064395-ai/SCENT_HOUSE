import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('[Paymob Payment API] Starting payment initialization...');
  try {
    const { orderId, fullname, phone, city, address, amount, items } = await req.json();

    const apiKey = process.env.PAYMOB_API_KEY;
    const integrationId = Number(process.env.PAYMOB_CARD_INTEGRATION_ID || '5771591');

    if (!apiKey) {
      console.error('[Paymob Payment API] Missing PAYMOB_API_KEY env variable.');
      return NextResponse.json({ error: 'Missing Paymob API Key configuration on the server.' }, { status: 500 });
    }

    // 1. Authenticate with Paymob
    console.log('[Paymob Payment API] Authenticating...');
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error('[Paymob Payment API] Auth failed:', errText);
      return NextResponse.json({ error: `Paymob Authentication failed: ${errText}` }, { status: 400 });
    }
    const { token: authToken } = await authRes.json();

    // 2. Register Order at Paymob
    console.log('[Paymob Payment API] Registering order...');
    const amountCents = Math.round(amount * 100);
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: amountCents.toString(),
        currency: 'EGP',
        merchant_order_id: orderId, // Our SH-XXXXX id
        items: items.map((item: any) => {
          let itemName = item.product?.name?.split(' - ')[0] || 'عطر';
          if (item.product?.category === 'gifts' && item.size?.perfumes) {
            const perfumesList = item.size.perfumes.map((p: any) => p.name).join(', ');
            itemName = `${itemName} (${perfumesList})`;
          }
          return {
            name: itemName.substring(0, 80),
            amount_cents: Math.round(item.size.price * 100).toString(),
            description: item.product?.description?.substring(0, 150) || 'Scent House Item',
            quantity: item.quantity.toString()
          };
        })
      })
    });
    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error('[Paymob Payment API] Order registration failed:', errText);
      return NextResponse.json({ error: `Paymob Order Registration failed: ${errText}` }, { status: 400 });
    }
    const paymobOrder = await orderRes.json();

    // Parse fullname into first & last name (Paymob requirements)
    const nameParts = fullname.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    // 3. Generate Payment Key
    console.log('[Paymob Payment API] Generating payment key...');
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents.toString(),
        expiration: 3600,
        order_id: paymobOrder.id,
        billing_data: {
          apartment: 'NA',
          email: 'customer@scenthouse.com',
          floor: 'NA',
          first_name: firstName,
          street: address || 'NA',
          building: 'NA',
          phone_number: phone,
          shipping_method: 'NA',
          postal_code: 'NA',
          city: city || 'Cairo',
          country: 'EG',
          last_name: lastName,
          state: 'NA'
        },
        currency: 'EGP',
        integration_id: integrationId,
        lock_order_to_token: true
      })
    });
    if (!paymentKeyRes.ok) {
      const errText = await paymentKeyRes.text();
      console.error('[Paymob Payment API] Payment Key failed:', errText);
      return NextResponse.json({ error: `Paymob Payment Key Generation failed: ${errText}` }, { status: 400 });
    }
    const { token: paymentToken } = await paymentKeyRes.json();

    // 4. Build Iframe redirect url
    const iframeId = process.env.PAYMOB_IFRAME_ID || '38194';
    const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;

    console.log('[Paymob Payment API] Payment key generated successfully. Redirecting to:', redirectUrl);
    return NextResponse.json({ redirectUrl });
  } catch (err: any) {
    console.error('[Paymob Payment API] Crash:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
