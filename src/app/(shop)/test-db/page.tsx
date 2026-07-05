'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [productResult, setProductResult] = useState('Testing...');
  const [orderResult, setOrderResult] = useState('Testing...');

  useEffect(() => {
    async function test() {
      // Test 1: read products
      const { data, error } = await supabase.from('products').select('id').limit(1);
      setProductResult(error ? `❌ ${error.message}` : `✅ Products OK — rows: ${data?.length}`);

      // Test 2: insert a dummy order using REAL column names
      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          orderDate: '1/1/2025',
          fullname: 'اختبار',
          phone: '01000000000',
          phone2: '01000000001',
          city: 'القاهرة',
          address: 'اختبار',
          paymentMethodLabel: 'اختبار',
          subtotal: 0,
          discount: 0,
          vat: 0,
          grandTotal: 0,
          status: 'جديد',
        })
        .select('id, "orderId"')
        .single();

      if (orderError) {
        setOrderResult(`❌ INSERT FAILED:\nCode: ${orderError.code}\nMessage: ${orderError.message}\nDetails: ${orderError.details}\nHint: ${orderError.hint}`);
      } else {
        await supabase.from('orders').delete().eq('id', orderRow.id);
        setOrderResult(`✅ Orders INSERT works!\nGenerated orderId: ${orderRow.orderId}`);
      }
    }
    test();
  }, []);

  const box = (label: string, content: string) => (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ color: '#D4AF37', marginBottom: '8px' }}>{label}</h3>
      <pre style={{
        padding: '16px', background: '#1a1a1a', borderRadius: '8px',
        border: `1px solid ${content.startsWith('✅') ? '#22c55e' : content.startsWith('❌') ? '#ef4444' : '#444'}`,
        color: content.startsWith('✅') ? '#86efac' : content.startsWith('❌') ? '#fca5a5' : '#888',
        whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.85rem'
      }}>{content}</pre>
    </div>
  );

  return (
    <div style={{ padding: '60px', fontFamily: 'monospace', color: 'white', background: '#111', minHeight: '100vh', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ color: '#D4AF37', marginBottom: '30px', fontSize: '1.4rem' }}>🔬 Supabase Connection Test</h2>
      {box('1. Products table (SELECT)', productResult)}
      {box('2. Orders table (INSERT with real columns)', orderResult)}
    </div>
  );
}
