const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://udfkqrpidntskfntkmye.supabase.co',
  'sb_publishable_eqq_xfMs702UVCI1m-0ETA_SqSiGfsY'
);

const naqaaProduct = {
  name: "نقاء - Naqa' Fresh",
  category: "unisex",
  categoryNameAr: "عطور مشتركة",
  price: 600,
  image: "/images/naqaa1.jpg",
  images: ["/images/naqaa1.jpg", "/images/naqaa2.jpg", "/images/naqaa3.jpg"],
  isBestSeller: false,
  isNew: true,
  rating: 5,
  reviewsCount: 0,
  description: `نقاء معمول للناس اللي بتحب الريحة النضيفة الهادية

اشتغلنا فيه على طابع:
فريش  
مريح  
وراقي جدًا

علشان تحس طول اليوم:
بالانتعاش والنضافة والثقة

مناسب:
للصيف  
الجامعة  
الشغل  
الاستخدام اليومي`,
  notes: {
    top: "جريت فروت وليمون اخضر و تفاح اخضر",
    heart: "توابل خفيفة و زهور بيضاء ولافندر",
    base: "مسك ابيض و خشب نضيف و اكورد مائي نضيف"
  },
  contents: "كحول عطري فاخر، زيوت عطرية فرنسية طبيعية، ماء مقطر عذب",
  sizes: [
    { ml: 30, price: 600 },
    { ml: 50, price: 800 }
  ]
};

async function insertProduct() {
  const { data, error } = await supabase.from('products').insert([naqaaProduct]).select();
  if (error) {
    console.error('Error inserting product:', error.message, error);
  } else {
    console.log('Product successfully inserted in database:', data);
  }
}

insertProduct();
