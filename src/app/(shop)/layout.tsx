'use client';

import React, { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingSocials from "@/components/FloatingSocials";
import ScrollToTop from "@/components/ScrollToTop";
import VisitTracker from "@/components/VisitTracker";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <VisitTracker />
      <Header />
      <CartDrawer />
      <div className="main-content">{children}</div>
      <Footer />
      <FloatingSocials />
    </>
  );
}
