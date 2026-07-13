export interface ProductNote {
  top: string;
  heart: string;
  base: string;
}

export interface ProductSize {
  ml: number;
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: number;
  name: string;
  category: "men" | "women" | "gifts" | "unisex";
  categoryNameAr: string;
  price: number;
  image: string;
  images?: string[];
  isBestSeller: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  notes?: ProductNote;
  contents?: string;
  sizes: ProductSize[];
  created_at?: string;
  price_before_discount?: number | null;
  price_after_discount?: number | null;
}

export const productsDatabase: Product[] = [
  {
    id: 1,
    name: "نبض - Nabd Fresh",
    category: "men",
    categoryNameAr: "العطور الرجالية",
    price: 600,
    image: "/images/nabd1.jpg",
    images: ["/images/nabd1.jpg", "/images/50ml.jpeg", "/images/nabd2.jpg"],
    isBestSeller: false,
    isNew: false,
    rating: 4.8,
    reviewsCount: 74,
    description: "نبض: انتعاش ونظافة تدوم معاك طول اليوم. عطر رياضي وحيوي يجمع بين حمضيات الليمون والنعناع المنعش مع قاعدة خشبية دافئة تدعم يومك الشاق بالثقة والنشاط.",
    notes: {
      top: "ليمون صقلي، تفاح أخضر، نعناع منعش",
      heart: "أزهار الياسمين، لافندر فرنسي، لمحة بخور خفيفة",
      base: "خشب الصندل، المسك الأبيض، نجيل الهند"
    },
    sizes: [
      { ml: 50, price: 650, originalPrice: 800 },
      { ml: 30, price: 400, originalPrice: 500 }
    ]
  },
  {
    id: 3,
    name: "هيبة - Hayba Presence",
    category: "men",
    categoryNameAr: "العطور الرجالية",
    price: 600,
    image: "/images/heeba1.jpg",
    images: ["/images/heeba1.jpg", "/images/50ml.jpeg", "/images/heeba2.jpg"],
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 194,
    description: "هيبة: حضور قوي وثبات يخليك مميز في أي مكان. عطر رجالي مهيب يعبر عن الفخامة والأصالة بفضل توليفة الزعفران والجلود المدخنة والعود المعتق الراقي.",
    notes: {
      top: "الهيل الهندي، الهيل الأسود، الزعفران الإيراني",
      heart: "الجلد الفاخر المدخن، العود الكمبودي النقي، خشب الصندل",
      base: "أخشاب الأرز، العنبر الكشميري، المسك الملكي"
    },
    sizes: [
      { ml: 50, price: 650, originalPrice: 800 },
      { ml: 30, price: 400, originalPrice: 500 }
    ]
  },
  {
    id: 4,
    name: "دلع - Dala' Gentle",
    category: "women",
    categoryNameAr: "العطور النسائية",
    price: 600,
    image: "/images/dalaa1.jpg",
    images: ["/images/dalaa1.jpg", "/images/mm30ml.jpeg", "/images/dalaa2.jpg"],
    isBestSeller: false,
    isNew: false,
    rating: 4.8,
    reviewsCount: 63,
    description: "دلع: نعومة وجاذبية بإحساس راقي وهادي. عطر نسائي ناعم كالحرير، يمزج عبير التوت البري المنعش بقلب زهري ممتلئ بمسك الرمان الأنثوي والكراميل الدافئ.",
    notes: {
      top: "التوت البري الحلو، ليمون وردي منعش، برتقال",
      heart: "الياسمين، الفانيليا الناعمة، أزهار الكرز",
      base: "مسك الرمان، بودرة ناعمة، لمحة كراميل دافئة"
    },
    sizes: [
      { ml: 50, price: 650, originalPrice: 800 },
      { ml: 30, price: 400, originalPrice: 500 }
    ]
  },
  {
    id: 5,
    name: "سحر الحب - Sahar Al-Hub",
    category: "women",
    categoryNameAr: "العطور النسائية",
    price: 600,
    image: "/images/sehr1.jpg",
    images: ["/images/sehr1.jpg", "/images/50ml.jpeg", "/images/sehr2.jpg"],
    isBestSeller: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 145,
    description: "سحر الحب: دفء وجاذبية يناسب السهرات والمناسبات السعيدة. توليفة دافئة وغامضة غنية بالياسمين الهندي والورد التركي والنفحات الشرقية الفاخرة للظهور الجذاب.",
    notes: {
      top: "البرغموت، توت العليق البري، الخوخ الحلو",
      heart: "الورد التركي الفاخر، الياسمين الهندي، أوراق الباتشولي",
      base: "خشب الصندل، العنبر الكشميري، المسك الأبيض النقي"
    },
    sizes: [
      { ml: 50, price: 650, originalPrice: 800 },
      { ml: 30, price: 400, originalPrice: 500 }
    ]
  },
  {
    id: 6,
    name: "مجد - Majd Majesty",
    category: "men",
    categoryNameAr: "العطور الرجالية",
    price: 600,
    image: "/images/magd1.jpg",
    images: ["/images/magd1.jpg", "/images/mm30ml.jpeg", "/images/magd2.jpg"],
    isBestSeller: true,
    isNew: true,
    rating: 5.0,
    reviewsCount: 124,
    description: "مجد: ريحة فخمة فيها توازن بين فاكهة منعشة وزهور ناعمة، ومعاها قاعدة دافئة من الفانيليا والأخشاب بتدي ثبات وهيبة. بتبدأ هادية وبعدها تبان فخامة الريحة وتفضل ثابتة طول اليوم 🤍",
    notes: {
      top: "تفاح منعش + حمضيات خفيفة (بداية لافتة فيها انتعاش وفخامة)",
      heart: "زهور ناعمة مع لمسة توابل (إحساس أنيق فيه عمق وهدوء راقي)",
      base: "فانيليا دافئة + خشب + مسك (ثبات عالي جدًا ودفا بيكمل معاك طول اليوم)"
    },
    sizes: [
      { ml: 50, price: 650, originalPrice: 800 },
      { ml: 30, price: 400, originalPrice: 500 }
    ]
  },
  {
    id: 7,
    name: "غرام - Gharam Love",
    category: "women",
    categoryNameAr: "العطور النسائية",
    price: 600,
    image: "/images/gharam1.jpg",
    images: ["/images/gharam1.jpg", "/images/gh.jpeg", "/images/gharam2.jpg"],
    isBestSeller: true,
    isNew: true,
    rating: 5.0,
    reviewsCount: 156,
    description: "غرام: مزيج ما بين أنوثة ناعمة ولمسة فاكهية جذابة… بربري هير مع مسك الرمان عاملين توليفة فيها نعومة بتلفت ودفا بيثبت في الجو. ريحة بتبدأ بحلاوة هادية وتتحول لإحساس نظيف وفخم يفضل معاك طول اليوم.",
    notes: {
      top: "توليفة فاكهية حمراء (فراولة + توت + رمان - بداية ملفتة وناعمة)",
      heart: "مسك أبيض نضيف + لمسة زهرية خفيفة (إحساس نظافة ونعومة أنثوية)",
      base: "فانيليا دافئة + مسك ثابت (ثبات ودفا يفضل على الجلد)"
    },
    sizes: [
      { ml: 50, price: 650, originalPrice: 800 },
      { ml: 30, price: 400, originalPrice: 500 }
    ]
  },
  // Gift Boxes
  {
    id: 9,
    name: "بوكس غرام ودلع الفاخر - Gharam & Dala' Gift Box",
    category: "gifts",
    categoryNameAr: "بوكسات الهدايا",
    price: 690,
    image: "/images/menbox.jpeg",
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 38,
    description: "بوكس مناسبات مخملي راقي يجمع ما بين عطر غرام الفاتن وعطر دلع الهادئ ليمنحك نعومة وجاذبية لا تقاوم.",
    contents: "عطر غرام 50مل، عطر دلع 50مل، مبخرة سيراميك مذهبة، كرت إهداء فاخر.",
    sizes: [{ ml: 100, price: 690 }]
  },
  {
    id: 10,
    name: "بوكس هيبة ومجد الملكي - Royal Oud & Majd Box",
    category: "gifts",
    categoryNameAr: "بوكسات الهدايا",
    price: 850,
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=600&auto=format&fit=crop",
    isBestSeller: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 47,
    description: "صندوق الإهداء النخبوي المتميز، يحتوي على عطر هيبة الرجالي الفخم وعطر مجد المتزن بنكهة الفواكه والأخشاب الدافئة.",
    contents: "عطر هيبة 50مل، عطر مجد 50مل، كبك مذهب فاخر، ربع تولة دهن عود معتق.",
    sizes: [{ ml: 100, price: 850 }]
  },
  {
    id: 11,
    name: "بوكس نبض ونقاء الانتعاش - Nabd & Naqa' Box",
    category: "gifts",
    categoryNameAr: "بوكسات الهدايا",
    price: 520,
    image: "/images/womenbox.jpeg",
    isBestSeller: false,
    isNew: false,
    rating: 4.9,
    reviewsCount: 22,
    description: "صندوق هدية مميز يفوح برائحة النظافة والنقاء والعبير اليومي المنعش.",
    contents: "عطر نبض 50مل، عطر نقاء 50مل، عينة مسك أبيض صغيرة، كرت إهداء.",
    sizes: [{ ml: 100, price: 520 }]
  },
  {
    id: 12,
    name: "بوكس مناسبات سحر الحب - Sahar Al-Hub Box",
    category: "gifts",
    categoryNameAr: "بوكسات الهدايا",
    price: 480,
    image: "https://images.unsplash.com/photo-1576016770956-debb63d900ad?q=80&w=600&auto=format&fit=crop",
    isBestSeller: false,
    isNew: false,
    rating: 4.8,
    reviewsCount: 34,
    description: "بوكس مناسبات معطر بشريط حريري فاخر يحتوي على عطر سحر الحب المثير للسهرات الخاصة.",
    contents: "عطر سحر الحب 50مل، وردة طبيعية مطلية بذهب عيار 24، شوكولاتة بلجيكية فاخرة.",
    sizes: [{ ml: 100, price: 480 }]
  },
  {
    id: 13,
    name: "صندوق الإهداء المخصص - Customized Scent Box",
    category: "gifts",
    categoryNameAr: "بوكسات الهدايا",
    price: 720,
    image: "/images/mixbox.jpeg",
    isBestSeller: false,
    isNew: false,
    rating: 4.9,
    reviewsCount: 51,
    description: "صندوق خشبي فاخر مطرز بالخيوط الذهبية يتيح لك اختيار أي عطرين وكتابة رسالة الإهداء الخاصة بك بخط مذهب يدوي.",
    contents: "عطرين من اختيارك (يحددان بالطلب)، بخور عود سيوفي طبيعي، فواحة سيراميك صغيرة.",
    sizes: [{ ml: 100, price: 720 }]
  },
  {
    id: 14,
    name: "نقاء - Naqa' Fresh",
    category: "men",
    categoryNameAr: "العطور الرجالية",
    price: 600,
    image: "/images/naqaa1.jpg",
    images: ["/images/naqaa1.jpg", "/images/naqaa2.jpg", "/images/naqaa3.jpg"],
    isBestSeller: false,
    isNew: true,
    rating: 5.0,
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
  }
];
