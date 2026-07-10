'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const pathname = usePathname();
  const { cart, wishlist, setCartOpen, settings } = useApp();

  const isLinkActive = (href: string) => {
    if (href === '/' && pathname === '/') return 'active';
    if (href !== '/' && pathname.startsWith(href)) return 'active';
    return '';
  };

  const showAnnouncement = settings ? (settings.announcement_bar_text && settings.announcement_bar_text.trim() !== '') : true;
  const announcementText = settings?.announcement_bar_text || "✨ شحن سريع ومجاني لجميع طلبات العروض! 🎁 استخدم كوبون SCENT10 لخصم 10% عند الدفع!";

  return (
    <header>
      {/* Top Premium Announcement Bar */}
      {showAnnouncement && (
        <div className="announcement-bar">
          <div className="announcement-content">
            <span>{announcementText}</span>
          </div>
        </div>
      )}

      <div className="header-container">
        {/* Brand Logo and Name */}
        <Link href="/" className="logo-container">
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
