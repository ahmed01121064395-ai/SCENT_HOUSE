'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const pathname = usePathname();
  const { cart, wishlist, setCartOpen } = useApp();

  const isLinkActive = (href: string) => {
    if (href === '/' && pathname === '/') return 'active';
    if (href !== '/' && pathname.startsWith(href)) return 'active';
    return '';
  };

  return (
    <header>
      {/* Top Premium Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span className="desktop-only">
            ✨ شحن سريع ومجاني لجميع طلبات العروض! 🎁 استخدم كوبون <strong className="gold-text">SCENT10</strong> لخصم 10% عند الدفع!
          </span>
          <span className="mobile-only">
            ✨ شحن مجاني + خصم 10% بكود: <strong className="gold-text">SCENT10</strong> 🎁
          </span>
        </div>
      </div>

      <div className="header-container">
        {/* Brand Logo and Name */}
        <Link href="/" className="logo-container">
          <img
            src="/images/LOGO.jpg"
            alt="شعار Scent House"
            className="logo-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/121212/D4AF37?text=Scent+House';
            }}
          />
          <span className="brand-title gold-text">SCENT HOUSE</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li className={`nav-item ${isLinkActive('/')}`}>
              <Link href="/">الرئيسية</Link>
            </li>
            <li className={`nav-item ${pathname.includes('category=men') ? 'active' : ''}`}>
              <Link href="/shop?category=men">العطور الرجالية</Link>
            </li>
            <li className={`nav-item ${pathname.includes('category=women') ? 'active' : ''}`}>
              <Link href="/shop?category=women">العطور النسائية</Link>
            </li>
            <li className={`nav-item ${pathname.includes('category=gifts') ? 'active' : ''}`}>
              <Link href="/shop?category=gifts">بوكسات الهدايا</Link>
            </li>
            <li className={`nav-item ${pathname === '/shop' && isLinkActive('/shop') ? 'active' : ''}`}>
              <Link href="/shop">المتجر</Link>
            </li>
            <li className={`nav-item ${isLinkActive('/about')}`}>
              <Link href="/about">من نحن</Link>
            </li>
            <li className={`nav-item ${isLinkActive('/contact')}`}>
              <Link href="/contact">تواصل معنا</Link>
            </li>
          </ul>
        </nav>

        {/* User Quick Actions */}
        <div className="nav-actions">
          {/* Wishlist Link */}
          <Link href="/shop?wishlist=true" className="icon-btn" title="المفضلة">
            <i className="fa-regular fa-heart"></i>
            {wishlist.length > 0 && (
              <span className="badge english-num">{wishlist.length}</span>
            )}
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            className="icon-btn"
            onClick={() => setCartOpen(true)}
            title="سلة المشتريات"
          >
            <i className="fa-solid fa-bag-shopping"></i>
            {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
              <span className="badge english-num">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
