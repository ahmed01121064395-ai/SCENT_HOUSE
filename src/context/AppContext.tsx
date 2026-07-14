'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, productsDatabase } from '../data/products';
import { supabase } from '../lib/supabase';

export interface CartItem {
  product: Product;
  size: {
    ml: number;
    price: number;
    price_after_discount?: number | null;
    price_before_discount?: number | null;
    originalPrice?: number | null;
    perfumes?: any[];
    [key: string]: any;
  };
  quantity: number;
  boxType?: string;
  giftMessage?: string;
}

export interface OrderInfo {
  orderId: string;
  orderDate: string;
  fullname: string;
  phone: string;
  phone2?: string;
  paymentMethodLabel: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: number[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string, customSizeObj?: any) => void;
  buyNow: (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string, customSizeObj?: any) => void;
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
  removeFromCart: (productId: number, sizeMl: number) => void;
  updateCartQuantity: (productId: number, sizeMl: number, quantity: number) => void;
  toggleWishlist: (productId: number) => void;
  applyCoupon: (code: string) => boolean;
  couponCode: string;
  discountPercent: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  clearCart: () => void;
  lastPlacedOrder: OrderInfo | null;
  setLastPlacedOrder: (order: OrderInfo | null) => void;
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
  coupons: any[];
  homepageFeatures: any[];
  testimonials: any[];
  giftBoxTypes: any[];
  refreshStage2Data: () => Promise<void>;
  specialOffers: any[];
  aboutContent: any | null;
  refreshStage3Data: () => Promise<void>;
}

export interface SiteSettings {
  announcement_bar_text: string;
  hero_title: string;
  hero_subtitle: string;
  hero_video_1_url: string;
  hero_video_2_url: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  contact_phone_1: string;
  contact_phone_2: string;
  contact_address: string;
  working_hours: string;
  men_category_title: string;
  men_category_subtitle: string;
  women_category_title: string;
  women_category_subtitle: string;
  gift_category_title: string;
  gift_category_subtitle: string;
  contact_email?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(productsDatabase);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderInfo | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [coupons, setCoupons] = useState<any[]>([]);
  const [homepageFeatures, setHomepageFeatures] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [giftBoxTypes, setGiftBoxTypes] = useState<any[]>([]);

  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
  const [aboutContent, setAboutContent] = useState<any | null>(null);

  const refreshSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (!error && data) {
      setSettings(data as SiteSettings);
    }
  };

  const refreshStage2Data = async () => {
    try {
      const { data: cData } = await supabase.from('coupons').select('*').order('code');
      if (cData) setCoupons(cData);

      const { data: fData } = await supabase.from('homepage_features').select('*').order('display_order');
      if (fData) setHomepageFeatures(fData);

      const { data: tData } = await supabase.from('testimonials').select('*').order('display_order');
      if (tData) setTestimonials(tData);

      const { data: gData } = await supabase.from('gift_box_types').select('*').order('display_order');
      if (gData) setGiftBoxTypes(gData);
    } catch (err) {
      console.error('Error fetching Stage 2 settings:', err);
    }
  };

  const refreshStage3Data = async () => {
    try {
      const { data: oData } = await supabase.from('special_offers').select('*').order('display_order');
      if (oData) setSpecialOffers(oData);

      const { data: aData } = await supabase.from('about_content').select('*').eq('id', 1).single();
      if (aData) setAboutContent(aData);
    } catch (err) {
      console.error('Error fetching Stage 3 settings:', err);
    }
  };

  // Load Stage 2 & 3 data on mount
  useEffect(() => {
    refreshStage2Data();
    refreshStage3Data();

    // Subscribe to Stage 2 tables realtime changes
    const fChannel = supabase.channel('features-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_features' }, () => { refreshStage2Data(); }).subscribe();
    const tChannel = supabase.channel('testimonials-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => { refreshStage2Data(); }).subscribe();
    const cChannel = supabase.channel('coupons-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => { refreshStage2Data(); }).subscribe();
    const gChannel = supabase.channel('giftbox-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'gift_box_types' }, () => { refreshStage2Data(); }).subscribe();

    // Subscribe to Stage 3 tables realtime changes
    const oChannel = supabase.channel('offers-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'special_offers' }, () => { refreshStage3Data(); }).subscribe();
    const aChannel = supabase.channel('about-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'about_content' }, () => { refreshStage3Data(); }).subscribe();

    return () => {
      fChannel.unsubscribe();
      tChannel.unsubscribe();
      cChannel.unsubscribe();
      gChannel.unsubscribe();
      oChannel.unsubscribe();
      aChannel.unsubscribe();
    };
  }, []);

  // Fetch site settings and subscribe to realtime changes
  useEffect(() => {
    async function initSettings() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        setSettings(data as SiteSettings);
      }
    }
    initSettings();

    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: 'id=eq.1'
        },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as SiteSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch real product data from Supabase
  useEffect(() => {
    const mapProductSizes = (prodList: any[]): Product[] => {
      return prodList.map(p => {
        if (p.sizes && Array.isArray(p.sizes)) {
          p.sizes = p.sizes.map((s: any) => ({
            ...s,
            price: s.price_after_discount !== undefined ? s.price_after_discount : (s.price || 0),
            originalPrice: s.price_before_discount !== undefined ? (s.price_before_discount || undefined) : (s.originalPrice || undefined)
          }));
        }
        return p as Product;
      });
    };

    async function loadRealProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
        
      if (!error && data) {
        if (data.length === 0 && productsDatabase.length > 0) {
          console.log('Database is empty. Auto-seeding default products...');
          
          // Map products to the database format
          const seedData = productsDatabase.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            categoryNameAr: p.categoryNameAr,
            price: p.price,
            image: p.image,
            images: p.images || [p.image],
            isBestSeller: p.isBestSeller,
            isNew: p.isNew,
            rating: p.rating,
            reviewsCount: p.reviewsCount,
            description: p.description,
            notes: p.notes,
            contents: p.contents,
            sizes: p.sizes
          }));

          const { error: seedError } = await supabase
            .from('products')
            .insert(seedData);

          if (!seedError) {
            // Re-fetch now that it is seeded
            const { data: refetchedData } = await supabase
              .from('products')
              .select('*')
              .order('id', { ascending: true });
            if (refetchedData) {
              setProducts(mapProductSizes(refetchedData));
            }
          } else {
            console.error('Failed to seed products:', seedError);
            setProducts(mapProductSizes(productsDatabase)); // fallback to static array
          }
        } else {
          setProducts(mapProductSizes(data));
        }
      } else {
        console.error('Failed to fetch products:', error);
        setProducts(mapProductSizes(productsDatabase)); // fallback on offline or query error
      }
    }
    loadRealProducts();

    // Subscribe to products table real-time changes
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });
          if (!error && data) {
            setProducts(mapProductSizes(data));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('scent_cart');
    const savedWishlist = localStorage.getItem('scent_wishlist');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save state to localStorage when it changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('scent_cart', JSON.stringify(newCart));
  };

  // Sync cart items prices with database discounts when products list is loaded or changed
  useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      let changed = false;
      const updatedCart = cart.map(item => {
        const prod = products.find(p => p.id === item.product.id);
        if (prod) {
          const dbSize = prod.sizes.find(s => s.ml === item.size.ml);
          if (dbSize) {
            const expectedPrice = dbSize.price_after_discount;
            const expectedOriginalPrice = dbSize.price_before_discount || null;
            if (item.size.price !== expectedPrice || item.size.originalPrice !== (expectedOriginalPrice || undefined)) {
              changed = true;
              return {
                ...item,
                product: prod,
                size: {
                  ...item.size,
                  price: expectedPrice,
                  price_after_discount: expectedPrice,
                  price_before_discount: expectedOriginalPrice,
                  originalPrice: expectedOriginalPrice || undefined
                }
              };
            }
          }
        }
        return item;
      });
      if (changed) {
        saveCart(updatedCart);
      }
    }
  }, [products]);

  const saveWishlist = (newWishlist: number[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('scent_wishlist', JSON.stringify(newWishlist));
  };

  const addToCart = (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string, customSizeObj?: any) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sizeObj = customSizeObj || product.sizes.find(s => s.ml === sizeMl) || product.sizes[0];

    const existingIndex = cart.findIndex(item => {
      if (item.product.id !== productId) return false;
      if (product.category === 'gifts') {
        return JSON.stringify(item.size?.perfumes) === JSON.stringify(sizeObj?.perfumes);
      }
      return item.size.ml === sizeMl;
    });

    const newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
      newCart[existingIndex].size = sizeObj; // make sure size price is updated
      if (boxType) newCart[existingIndex].boxType = boxType;
      if (giftMessage) newCart[existingIndex].giftMessage = giftMessage;
    } else {
      newCart.push({
        product,
        size: sizeObj,
        quantity,
        boxType,
        giftMessage
      });
    }

    saveCart(newCart);
    setCartOpen(true); // Open drawer on add
  };

  // buyNow: sets the temporary checkout item and does NOT open the drawer or change persistent cart
  const buyNow = (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string, customSizeObj?: any) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sizeObj = customSizeObj || product.sizes.find(s => s.ml === sizeMl) || product.sizes[0];

    setBuyNowItem({
      product,
      size: sizeObj,
      quantity,
      boxType,
      giftMessage
    });
  };

  const removeFromCart = (productId: number, sizeMl: number) => {
    const newCart = cart.filter(item => !(item.product.id === productId && item.size.ml === sizeMl));
    saveCart(newCart);
  };

  const updateCartQuantity = (productId: number, sizeMl: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeMl);
      return;
    }
    const newCart = cart.map(item => {
      if (item.product.id === productId && item.size.ml === sizeMl) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(newCart);
  };

  const toggleWishlist = async (productId: number) => {
    const index = wishlist.indexOf(productId);
    const newWishlist = [...wishlist];
    
    // Retrieve or generate a unique session ID for wishlist tracking
    let sid = localStorage.getItem('scent_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('scent_session_id', sid);
    }

    if (index > -1) {
      newWishlist.splice(index, 1);
      // Remove like/wishlist log from Supabase
      await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('session_id', sid);
    } else {
      newWishlist.push(productId);
      // Log like/wishlist addition to Supabase
      await supabase
        .from('product_likes')
        .insert({ product_id: productId, session_id: sid });
    }
    saveWishlist(newWishlist);
  };

  const applyCoupon = (code: string): boolean => {
    const cleaned = code.trim().toUpperCase();
    const match = coupons.find(c => c.code.toUpperCase() === cleaned && c.is_active);
    if (match) {
      setCouponCode(match.code);
      setDiscountPercent(match.discount_percent);
      return true;
    }
    return false;
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item.size.price_after_discount ?? item.size.price) * item.quantity), 0);
  const cartDiscount = Math.round(cartSubtotal * (discountPercent / 100));
  const cartTotal = cartSubtotal - cartDiscount;

  return (
    <AppContext.Provider value={{
      products,
      cart,
      wishlist,
      isCartOpen,
      setCartOpen,
      addToCart,
      buyNow,
      buyNowItem,
      setBuyNowItem,
      removeFromCart,
      updateCartQuantity,
      toggleWishlist,
      applyCoupon,
      couponCode,
      discountPercent,
      cartSubtotal,
      cartDiscount,
      cartTotal,
      clearCart,
      lastPlacedOrder,
      setLastPlacedOrder,
      settings,
      refreshSettings,
      coupons,
      homepageFeatures,
      testimonials,
      giftBoxTypes,
      refreshStage2Data,
      specialOffers,
      aboutContent,
      refreshStage3Data
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
