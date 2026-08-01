const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '4688660308082742';

// Normalize Egyptian phone number according to Facebook specification:
// Keep digits only, remove leading zero and prepend '20' (Egypt country code)
export function normalizePhoneForFB(phone: string): string {
  let clean = phone.replace(/\D/g, ''); // keep digits only
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '20' + clean.slice(1);
  } else if (!clean.startsWith('20') && clean.length === 10) {
    clean = '20' + clean;
  } else if (clean.startsWith('002')) {
    clean = clean.slice(2);
  }
  return clean;
}

// Client-side SHA-256 hashing using Web Crypto API
export async function hashSHA256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Re-initialize Facebook Pixel with client-side hashed phone number for Advanced Matching
export async function initFacebookPixelWithPhone(phone: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  try {
    const cleanPhone = normalizePhoneForFB(phone);
    if (!cleanPhone) return;
    const hashedPhone = await hashSHA256(cleanPhone);
    
    console.log('[Facebook Pixel] Re-initializing with hashed phone for Advanced Matching:', hashedPhone);
    window.fbq('init', FB_PIXEL_ID, { ph: hashedPhone });
    window.fbq('track', 'PageView');
  } catch (err) {
    console.error('[Facebook Pixel] Error initializing Advanced Matching:', err);
  }
}

// Standard Event Helpers:

// 1. ViewContent
export function trackViewContent(name: string, ids: string[], price: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: name,
      content_ids: ids,
      content_type: 'product',
      value: price,
      currency: 'EGP'
    });
  }
}

// 2. Search
export function trackSearch(query: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: query
    });
  }
}

// 3. AddToCart
export function trackAddToCart(name: string, ids: string[], price: number, quantity: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: name,
      content_ids: ids,
      content_type: 'product',
      value: price * quantity,
      currency: 'EGP'
    });
  }
}

// 4. AddToWishlist
export function trackAddToWishlist(name: string, ids: string[], price: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToWishlist', {
      content_name: name,
      content_ids: ids,
      content_type: 'product',
      value: price,
      currency: 'EGP'
    });
  }
}

// 5. InitiateCheckout
export function trackInitiateCheckout(total: number, numItems: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'EGP',
      num_items: numItems
    });
  }
}

// 6. AddPaymentInfo
export function trackAddPaymentInfo(total: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      value: total,
      currency: 'EGP'
    });
  }
}

// 7. Purchase
export function trackPurchase(total: number, ids: string[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: total,
      currency: 'EGP',
      content_ids: ids,
      content_type: 'product'
    });
  }
}
