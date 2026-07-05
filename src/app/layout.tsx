import { Suspense } from "react";
import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingSocials from "@/components/FloatingSocials";
import ScrollToTop from "@/components/ScrollToTop";
import { Cairo, Cinzel, Montserrat } from 'next/font/google';
import "./globals.css";

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Scent House | دار العطور الفاخرة",
  description: "عطور تُكتب بعبق التاريخ وتنبض بالحاضر - Scent House",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${cairo.variable} ${cinzel.variable} ${montserrat.variable} antialiased`}>
        <AppProvider>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <Header />
          <CartDrawer />
          <main className="main-content">{children}</main>
          <Footer />
          <FloatingSocials />
        </AppProvider>
      </body>
    </html>
  );
}
