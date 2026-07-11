import { NextRequest, NextResponse } from 'next/server';

// Paymob Integration Constants (hardcoded as fallback)
const PAYMOB_CARD_INTEGRATION_ID = 5771591;
const PAYMOB_WALLET_INTEGRATION_ID = 5774297;
const PAYMOB_KIOSK_INTEGRATION_ID = 5774294;
const PAYMOB_IFRAME_ID = '1058892'; // "My new card Iframe"

export async function POST(req: NextRequest) {
  console.log('[Paymob Payment API] Starting payment initialization...');
  try {
    const { 
      orderId, 
      fullname, 
      phone, 
      phone2,
      discount = 0,
      city, 
      address, 
      amount, 
      items, 
      paymentMethod = 'card', 
      walletNumber 
    } = await req.json();

    const apiKey = process.env.PAYMOB_API_KEY;

    if (!apiKey) {
      console.error('[Paymob Payment API] Missing PAYMOB_API_KEY env variable.');
      return NextResponse.json({ error: 'Missing Paymob API Key configuration on the server.' }, { status: 500 });
    }

    // Determine integration ID based on payment method
    let integrationId = PAYMOB_CARD_INTEGRATION_ID;
    if (paymentMethod === 'wallet') {
      integrationId = Number(process.env.PAYMOB_WALLET_INTEGRATION_ID) || PAYMOB_WALLET_INTEGRATION_ID;
    } else if (paymentMethod === 'kiosk') {
      integrationId = Number(process.env.PAYMOB_KIOSK_INTEGRATION_ID) || PAYMOB_KIOSK_INTEGRATION_ID;
    } else {
      integrationId = Number(process.env.PAYMOB_CARD_INTEGRATION_ID) || PAYMOB_CARD_INTEGRATION_ID;
    }

    const iframeId = process.env.PAYMOB_IFRAME_ID || PAYMOB_IFRAME_ID;

    console.log(`[Paymob Payment API] Method: ${paymentMethod}, Integration ID: ${integrationId}`);

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
        merchant_order_id: orderId,
        items: items.map((item: any) => {
          let itemName = item.product?.name?.split(' - ')[0] || 'عطر';
          if (item.product?.category === 'gifts' && item.size?.perfumes) {
            const perfumesList = item.size.perfumes.map((p: any) => p.name).join(', ');
            itemName = `${itemName} (${perfumesList})`;
          }
          // Serialize item metadata inside description field
          const itemMeta = {
            productId: Number(item.product.id),
            ml: Number(item.size.ml),
            price: Number(item.size.price),
            boxType: item.boxType || null,
            giftMessage: item.giftMessage || null
          };
          return {
            name: itemName.substring(0, 80),
            amount_cents: Math.round(item.size.price * 100).toString(),
            description: JSON.stringify(itemMeta),
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
    console.log(`[Paymob Payment API] Generating payment key for integration ${integrationId}...`);
    const paymentKeyBody = {
      auth_token: authToken,
      amount_cents: amountCents.toString(),
      expiration: 3600,
      order_id: paymobOrder.id,
      billing_data: {
        apartment: phone2 || 'NA', // Store phone2 in apartment
        email: 'customer@scenthouse.com',
        floor: 'NA',
        first_name: firstName,
        street: address || 'NA',
        building: 'NA',
        phone_number: phone,
        shipping_method: 'NA',
        postal_code: discount.toString(), // Store discount in postal_code
        city: city || 'Cairo',
        country: 'EG',
        last_name: lastName,
        state: paymentMethod // Store paymentMethod in state
      },
      currency: 'EGP',
      integration_id: integrationId,
      lock_order_to_token: true
    };
    
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentKeyBody)
    });
    if (!paymentKeyRes.ok) {
      const errText = await paymentKeyRes.text();
      console.error('[Paymob Payment API] Payment Key failed:', errText);
      return NextResponse.json({ error: `Paymob Payment Key Generation failed: ${errText}` }, { status: 400 });
    }
    const { token: paymentToken } = await paymentKeyRes.json();

    // 4. Handle Redirection URL or Kiosk Reference API payment
    if (paymentMethod === 'wallet' || paymentMethod === 'kiosk') {
      console.log(`[Paymob Payment API] Requesting Pay API for ${paymentMethod}...`);
      const payBody: any = {
        payment_token: paymentToken
      };

      if (paymentMethod === 'wallet') {
        const rawNumber = walletNumber || phone || '';
        let cleaned = rawNumber.replace(/\D/g, ''); // Keep only digits
        if (cleaned.startsWith('20') && cleaned.length > 10) {
          cleaned = cleaned.slice(2);
        } else if (cleaned.startsWith('0020') && cleaned.length > 12) {
          cleaned = cleaned.slice(4);
        }
        // Prefix with 0 if it is a 10-digit number starting with 1 (e.g. 10xxxxxxxx -> 010xxxxxxxx)
        if (cleaned.length === 10 && cleaned.startsWith('1')) {
          cleaned = '0' + cleaned;
        }
        
        console.log(`[Paymob Payment API] Sanitized wallet identifier: ${cleaned}`);
        payBody.source = {
          identifier: cleaned,
          subtype: 'WALLET'
        };
      } else {
        // kiosk
        payBody.source = {
          identifier: 'AGGREGATOR',
          subtype: 'AGGREGATOR'
        };
      }

      const payRes = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payBody)
      });

      if (!payRes.ok) {
        const errText = await payRes.text();
        console.error(`[Paymob Payment API] Pay call failed for ${paymentMethod}:`, errText);
        return NextResponse.json({ error: `Paymob Payment Request failed: ${errText}` }, { status: 400 });
      }

      const payResult = await payRes.json();
      console.log(`[Paymob Payment API] Pay response:`, JSON.stringify(payResult, null, 2));

      if (paymentMethod === 'wallet') {
        const redirectUrl = payResult.redirect_url || payResult.iframe_redirection_url;
        if (!redirectUrl) {
          return NextResponse.json({ error: 'No redirect URL returned for mobile wallet payment' }, { status: 400 });
        }
        return NextResponse.json({ redirectUrl });
      } else {
        // kiosk
        const billReference = payResult.data?.bill_reference;
        if (!billReference) {
          return NextResponse.json({ error: 'No bill reference returned for kiosk cash payment' }, { status: 400 });
        }
        return NextResponse.json({ billReference });
      }
    } else {
      // credit card - returns direct hosted checkout page iframe URL
      const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
      console.log('[Paymob Payment API] Hosted credit card redirect URL generated:', redirectUrl);
      return NextResponse.json({ redirectUrl });
    }
  } catch (err: any) {
    console.error('[Paymob Payment API] Crash:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
