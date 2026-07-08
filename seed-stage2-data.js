const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://udfkqrpidntskfntkmye.supabase.co',
  'sb_publishable_eqq_xfMs702UVCI1m-0ETA_SqSiGfsY'
);

async function seedData() {
  console.log('Seeding homepage_features...');
  const { error: fErr } = await supabase.from('homepage_features').insert([
    { icon: 'fa-gem', title: 'مكونات طبيعية نادرة ومختارة', display_order: 1 },
    { icon: 'fa-crown', title: 'فخامة وروائح لا تضاهى', display_order: 2 },
    { icon: 'fa-hourglass-half', 'title': 'ثبات وتأثير عالي يدوم طويلاً', display_order: 3 },
    { icon: 'fa-truck-fast', title: 'شحن وتوصيل فاخر وسريع', display_order: 4 }
  ]);
  if (fErr) console.error('Error seeding homepage_features:', fErr.message);

  console.log('Seeding testimonials...');
  const { error: tErr } = await supabase.from('testimonials').insert([
    { image_url: '/images/WhatsApp%20Image%202026-06-11%20at%202.09.04%20PM.jpeg', display_order: 1 },
    { image_url: '/images/WhatsApp%20Image%202026-06-11%20at%202.09.04%20PMtryutu.jpeg', display_order: 2 },
    { image_url: '/images/WhatsApp%20Image%202026-06-11%20at%202.09.05%20PM.jpeg', display_order: 3 },
    { image_url: '/images/WhatsApp%20Image%202026-06-11%20at%202.09.05%20PMrewteewr.jpeg', display_order: 4 },
    { image_url: '/images/WhatsApp%20Image%202026-06-11%20at%202.09.06%20PM.jpeg', display_order: 5 },
    { image_url: '/images/WhatsApp%20Image%202026-06-21%20at%203.18.59%20AM.jpeg', display_order: 6 },
    { image_url: '/images/WhatsApp%20Image%202026-06-21%20at%203.19.00%20AM.jpeg', display_order: 7 },
    { image_url: '/images/890.jpeg', display_order: 8 },
    { image_url: '/images/ertget.jpeg', display_order: 9 },
    { image_url: '/images/m.jpeg', display_order: 10 },
    { image_url: '/images/n.jpeg', display_order: 11 },
    { image_url: '/images/wqe.jpeg', display_order: 12 }
  ]);
  if (tErr) console.error('Error seeding testimonials:', tErr.message);

  console.log('Seeding coupons...');
  const { error: cErr } = await supabase.from('coupons').insert([
    { code: 'SCENT10', discount_percent: 10, is_active: true },
    { code: 'ROYAL20', discount_percent: 20, is_active: true }
  ]);
  if (cErr) console.error('Error seeding coupons:', cErr.message);

  console.log('Seeding gift_box_types...');
  const { error: bErr } = await supabase.from('gift_box_types').insert([
    { name: 'بوكس فاخر بقفل مغناطيسي', code: 'luxury', display_order: 1 },
    { name: 'بوكس مناسبات يوم ميلاد', code: 'birthday', display_order: 2 },
    { name: 'بوكس مناسبات ذكرى زواج', code: 'anniversary', display_order: 3 },
    { name: 'بوكس إهداء رجالي أسود وذهبي', code: 'men', display_order: 4 },
    { name: 'بوكس إهداء نسائي مخملي', code: 'women', display_order: 5 }
  ]);
  if (bErr) console.error('Error seeding gift_box_types:', bErr.message);

  console.log('Seeding completed!');
}

seedData();
