const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://udfkqrpidntskfntkmye.supabase.co',
  'sb_publishable_eqq_xfMs702UVCI1m-0ETA_SqSiGfsY'
);

async function printRows() {
  const { data: features } = await supabase.from('homepage_features').select('*');
  console.log('homepage_features count:', features ? features.length : 0);
  
  const { data: testimonials } = await supabase.from('testimonials').select('*');
  console.log('testimonials count:', testimonials ? testimonials.length : 0);

  const { data: coupons } = await supabase.from('coupons').select('*');
  console.log('coupons count:', coupons ? coupons.length : 0);

  const { data: boxTypes } = await supabase.from('gift_box_types').select('*');
  console.log('gift_box_types count:', boxTypes ? boxTypes.length : 0);
}

printRows();
