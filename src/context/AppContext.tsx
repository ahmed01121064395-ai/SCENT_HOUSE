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

  const toggleWishlist = (productId: number) => {
    const index = wishlist.indexOf(productId);
    const newWishlist = [...wishlist];
    if (index > -1) {
      newWishlist.splice(index, 1);
    } else {
      newWishlist.push(productId);
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
      setLastPlacedOrder
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
