import { supabase } from './supabase';

export interface PaymobOrderData {
  id: number;
  merchant_order_id: string;
  amount_cents: number;
  items: Array<{
    name: string;
    amount_cents: number;
    description: string;
    quantity: number;
  }>;
  shipping_data: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    street: string;
    apartment: string; // phone2
    postal_code: string; // discount
    city: string;
    state: string; // paymentMethod
  };
}

// Log order creation errors
export async function logOrderCreationError(merchantOrderId: string, errorMsg: string, payload: any) {
  const errorObj = {
    merchant_order_id: merchantOrderId,
    error_message: errorMsg,
    payload: JSON.stringify(payload),
    created_at: new Date().toISOString()
  };

  console.error(`[Order Creation Error] Order: ${merchantOrderId} | Error: ${errorMsg}`, payload);

  try {
    // Try to insert into order_creation_errors table if it exists
    const { error } = await supabase.from('order_creation_errors').insert(errorObj);
    if (error) {
      console.warn('[Order Creation Error Logging] Note: Could not write to public.order_creation_errors table (this is normal if table is not created in Supabase yet):', error.message);
    } else {
      console.log('[Order Creation Error Logging] Logged to Supabase order_creation_errors table successfully.');
    }
  } catch (err: any) {
    console.error('[Order Creation Error Logging] Crash logging to DB:', err.message);
  }
}

// Creates the order dynamically from Paymob transaction/order payload
export async function createOrderFromPaymob(orderData: PaymobOrderData, integrationId: number) {
  const merchantOrderId = orderData.merchant_order_id;
  console.log(`[Order Creation] Starting creation for merchant order: ${merchantOrderId}...`);

  try {
    // 1. Prevent duplicate creations (safeguard)
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, orderId, status')
      .eq('orderId', merchantOrderId)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check existing order: ${checkError.message}`);
    }

    if (existingOrder) {
      console.log(`[Order Creation] Order ${merchantOrderId} already exists with ID: ${existingOrder.id}. Skipping duplicate insertion.`);
      
      // If the order status is currently 'ملغي' (unpaid default), update it to 'جديد' since payment is now verified
      if (existingOrder.status === 'ملغي') {
        let paymentLabel = 'بطاقة بنكية - تم الدفع';
        if (integrationId === 5774297) {
          paymentLabel = 'محفظة هاتف محمول - تم الدفع';
        } else if (integrationId === 5774294) {
          paymentLabel = 'دفع كشك (أمان/مصاري) - تم الدفع';
        }
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'جديد',
            paymentMethodLabel: paymentLabel
          })
          .eq('id', existingOrder.id);

        if (updateError) {
          throw new Error(`Failed to update existing order status: ${updateError.message}`);
        }
        console.log(`[Order Creation] Updated existing order ${merchantOrderId} status to 'جديد' (paid).`);
      }
      return existingOrder;
    }

    // 2. Parse billing details from shipping_data
    const sData = orderData.shipping_data;
    if (!sData) {
      throw new Error('Missing shipping_data in order payload');
    }

    const fullname = `${sData.first_name || ''} ${sData.last_name || ''}`.trim() || 'عميل دفع إلكتروني';
    const phone = sData.phone_number || '';
    const phone2 = sData.apartment !== 'NA' ? sData.apartment : null;
    const city = sData.city || 'الفيوم';
    const address = sData.street || 'NA';
    const discount = Number(sData.postal_code) || 0;
    const grandTotal = Number(orderData.amount_cents) / 100;
    
    // Map payment labels
    let paymentMethodLabel = 'بطاقة بنكية - تم الدفع';
    if (integrationId === 5774297) {
      paymentMethodLabel = 'محفظة هاتف محمول - تم الدفع';
    } else if (integrationId === 5774294) {
      paymentMethodLabel = 'دفع كشك (أمان/مصاري) - تم الدفع';
    }

    const orderDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    });

    // 3. Decode items
    let subtotal = 0;
    const decodedItems = (orderData.items || []).map((item) => {
      let productId = 0;
      let ml = 50;
      let boxType = null;
      let giftMessage = null;

      try {
        if (item.description && item.description.startsWith('{')) {
          const meta = JSON.parse(item.description);
          productId = Number(meta.productId) || 0;
          ml = Number(meta.ml) || 50;
          boxType = meta.boxType || null;
          giftMessage = meta.giftMessage || null;
        }
      } catch (err: any) {
        console.warn(`[Order Creation] Failed parsing description for item ${item.name}:`, err.message);
      }

      const itemPrice = Number(item.amount_cents) / 100;
      subtotal += itemPrice * item.quantity;

      return {
        productId,
        quantity: item.quantity,
        size: {
          ml: ml,
          price: itemPrice
        },
        boxType,
        giftMessage
      };
    });

    console.log(`[Order Creation] Inserting order row for ${merchantOrderId}...`);

    // 4. Insert order row into DB
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        orderId: merchantOrderId,
        orderDate,
        fullname,
        phone,
        phone2,
        city,
        address,
        paymentMethodLabel,
        subtotal,
        discount,
        vat: 0,
        grandTotal,
        status: 'جديد' // Verified paid order
      })
      .select('id, orderId')
      .single();

    if (orderError) {
      throw new Error(`orders insert failed: ${orderError.message}`);
    }

    console.log(`[Order Creation] Order row created with internal ID: ${orderRow.id}. Inserting ${decodedItems.length} order items...`);

    // 5. Insert order items
    const itemRows = decodedItems.map(item => ({
      order_id: orderRow.id,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      boxType: item.boxType,
      giftMessage: item.giftMessage
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) {
      console.error(`[Order Creation] order_items insert failed for order ID ${orderRow.id}:`, itemsError.message);
      // Note: We don't crash here since the main order is already created, but we log the error
      await logOrderCreationError(merchantOrderId, `order_items insert failed: ${itemsError.message}`, itemRows);
    } else {
      console.log(`[Order Creation] Successfully created all order items for ${merchantOrderId}!`);
    }

    return orderRow;
  } catch (err: any) {
    console.error(`[Order Creation] Exception in order creation for ${merchantOrderId}:`, err.message);
    await logOrderCreationError(merchantOrderId, err.message, orderData);
    throw err;
  }
}
