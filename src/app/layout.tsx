import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import { Cairo, Cinzel, Montserrat } from "next/font/google";
import TikTokPixel from "@/components/TikTokPixel";
import FacebookPixel from "@/components/FacebookPixel";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
  display: "swap",
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${montserrat.variable} ${cinzel.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased">
        <AppProvider>
          <TikTokPixel />
          <FacebookPixel />
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || '4688660308082742'}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
