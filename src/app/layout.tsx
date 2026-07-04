import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingSocials from "@/components/FloatingSocials";
import "./globals.css";

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
      <body className="antialiased">
        <AppProvider>
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
