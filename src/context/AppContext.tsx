'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, productsDatabase } from '../data/products';
import { supabase } from '../lib/supabase';

export interface CartItem {
  product: Product;
  size: { ml: number; price: number };
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
  addToCart: (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string) => void;
  buyNow: (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string) => void;
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
  theme: 'current' | 'monochrome_gold';
  setTheme: (theme: 'current' | 'monochrome_gold') => void;
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
}

export interface SiteSettings {
  active_theme: 'current' | 'monochrome_gold';
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
  const [theme, setThemeState] = useState<'current' | 'monochrome_gold'>('current');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

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

  // Fetch theme and subscribe to changes in real-time
  useEffect(() => {
    async function initTheme() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (!error && data) {
        setSettings(data as SiteSettings);
        const activeTheme = data.active_theme as 'current' | 'monochrome_gold';
        setThemeState(activeTheme);
        
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
          if (activeTheme === 'monochrome_gold') {
            document.documentElement.setAttribute('data-theme', 'monochrome_gold');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
        }
      }
    }
    
    initTheme();

    const channel = supabase
      .channel('theme-changes')
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
            const activeTheme = payload.new.active_theme as 'current' | 'monochrome_gold';
            setThemeState(activeTheme);
            
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
              if (activeTheme === 'monochrome_gold') {
                document.documentElement.setAttribute('data-theme', 'monochrome_gold');
              } else {
                document.documentElement.removeAttribute('data-theme');
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const setTheme = async (newTheme: 'current' | 'monochrome_gold') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
      if (newTheme === 'monochrome_gold') {
        document.documentElement.setAttribute('data-theme', 'monochrome_gold');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
    await supabase
      .from('site_settings')
      .update({ active_theme: newTheme })
      .eq('id', 1);
  };

  // Fetch real product data from Supabase
  useEffect(() => {
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
              setProducts(refetchedData as Product[]);
            }
          } else {
            console.error('Failed to seed products:', seedError);
            setProducts(productsDatabase); // fallback to static array
          }
        } else {
          setProducts(data as Product[]);
        }
      } else {
        console.error('Failed to fetch products:', error);
        setProducts(productsDatabase); // fallback on offline or query error
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
            setProducts(data as Product[]);
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

  const saveWishlist = (newWishlist: number[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('scent_wishlist', JSON.stringify(newWishlist));
  };

  const addToCart = (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sizeObj = product.sizes.find(s => s.ml === sizeMl) || product.sizes[0];
    const existingIndex = cart.findIndex(item => item.product.id === productId && item.size.ml === sizeMl);

    const newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
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
  const buyNow = (productId: number, sizeMl: number, quantity: number, boxType?: string, giftMessage?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sizeObj = product.sizes.find(s => s.ml === sizeMl) || product.sizes[0];
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
    if (cleaned === 'SCENT10') {
      setCouponCode(cleaned);
      setDiscountPercent(10);
      return true;
    }
    if (cleaned === 'ROYAL20') {
      setCouponCode(cleaned);
      setDiscountPercent(20);
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
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.size.price * item.quantity), 0);
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
      theme,
      setTheme,
      settings,
      refreshSettings
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
