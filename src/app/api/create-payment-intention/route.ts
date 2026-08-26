import { NextRequest, NextResponse } from 'next/server';

// Paymob Integration Constants (hardcoded fallbacks)
const PAYMOB_CARD_INTEGRATION_ID = 5815860;
const PAYMOB_WALLET_INTEGRATION_ID = 5815858;
const PAYMOB_APPLEPAY_INTEGRATION_ID = 5815859;

export async function POST(req: NextRequest) {
  console.log('[Paymob Intention API] Creating payment intention...');
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
      items 
    } = await req.json();

    const secretKey = process.env.PAYMOB_SECRET_KEY || process.env.PAYMOB_API_KEY;

    if (!secretKey) {
      console.error('[Paymob Intention API] Missing PAYMOB_SECRET_KEY or PAYMOB_API_KEY environment variable.');
      return NextResponse.json({ error: 'Missing Paymob secret key configuration.' }, { status: 500 });
    }

    const cardId = Number(process.env.PAYMOB_CARD_INTEGRATION_ID) || PAYMOB_CARD_INTEGRATION_ID;
    const walletId = Number(process.env.PAYMOB_WALLET_INTEGRATION_ID) || PAYMOB_WALLET_INTEGRATION_ID;
    const applePayId = Number(process.env.PAYMOB_APPLEPAY_INTEGRATION_ID) || PAYMOB_APPLEPAY_INTEGRATION_ID;

    // Split fullname into first & last name for billing_data compliance
    const nameParts = fullname.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const amountCents = Math.round(amount * 100);

    // Clean phone number: prepend +20 if it starts with 0 and doesn't already have it
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = '+2' + cleanPhone;
    } else if (cleanPhone.startsWith('20') && cleanPhone.length === 12) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+') && cleanPhone.length === 10) {
      cleanPhone = '+20' + cleanPhone;
    }

    // Build items payload for custom tracking/debugging inside Paymob dashboard
    const formattedItems = items.map((item: any) => {
      let itemName = item.product?.name?.split(' - ')[0] || 'عطر';
      if (item.product?.category === 'gifts' && item.size?.perfumes) {
        const perfumesList = item.size.perfumes.map((p: any) => p.name).join(', ');
        itemName = `${itemName} (${perfumesList})`;
      }
      const itemPrice = Number(item.size.price_after_discount ?? item.size.price);
      return {
        name: itemName.substring(0, 80),
        amount: Math.round(itemPrice * 100),
        description: `Product ID: ${item.product.id}, Size: ${item.size.ml}ml`,
        quantity: Number(item.quantity)
      };
    });

    // Build the request body for Paymob Intention API v1
    const requestBody = {
      amount: amountCents,
      currency: 'EGP',
      payment_methods: [cardId, walletId, applePayId],
      billing_data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: cleanPhone,
        email: 'customer@scenthouse.com',
        street: address || 'NA',
        building: 'NA',
        floor: 'NA',
        apartment: 'NA',
        city: city || 'Cairo',
        state: 'NA',
        country: 'EG'
      },
      extras: {
        merchant_order_id: orderId,
        phone2: phone2 || null,
        discount: discount,
        cart_items: items.map((item: any) => ({
          productId: Number(item.product.id),
          ml: Number(item.size.ml),
          price: Number(item.size.price_after_discount ?? item.size.price),
          quantity: Number(item.quantity),
          boxType: item.boxType || null,
          giftMessage: item.giftMessage || null
        }))
      }
    };

    console.log('[Paymob Intention API] Sending request to Paymob...');
    const response = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Paymob Intention API] Paymob error response:', errorText);
      return NextResponse.json({ 
        error: `Paymob API failure: ${errorText} (Integrations used: Card=${cardId}, Wallet=${walletId}, ApplePay=${applePayId})` 
      }, { status: 400 });
    }

    const data = await response.json();
    console.log('[Paymob Intention API] Intention created successfully:', data.id);

    const publicKey = process.env.PAYMOB_PUBLIC_KEY || 'egy_pk_live_Ii5iE3TWaB4gJDV1EKry0NWsq9LDwTPo';

    // Return the client_secret, public key and the newly created Paymob intention ID
    return NextResponse.json({ 
      clientSecret: data.client_secret,
      intentionId: data.id,
      publicKey: publicKey
    });

  } catch (err: any) {
    console.error('[Paymob Intention API] Exception:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
