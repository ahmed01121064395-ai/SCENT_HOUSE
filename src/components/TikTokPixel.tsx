'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const TIKTOK_PIXEL_ID = 'D99AC13C77U7PGVAJDMG';

declare global {
  interface Window {
    ttq?: {
      load: (id: string) => void;
      page: () => void;
      track: (event: string, data?: any) => void;
      [key: string]: any;
    };
  }
}

function TikTokPixelInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    }
  }, [pathname, searchParams]);

  return null;
}

export default function TikTokPixel() {
  return (
    <Suspense fallback={null}>
      <TikTokPixelInner />
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokSdkObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = [
                "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "setCookie"
              ];
              ttq.setAndDefer = function (e, t) {
                e[t] = function () {
                  e.push([t].concat(Array.prototype.slice.call(arguments, 0)))
                }
              };
              for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
              ttq.instance = function (e) {
                for (var t = ttq._i[e] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(t, ttq.methods[n]);
                return t
              };
              ttq.load = function (e, n) {
                var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {};
                var o = d.createElement("script");
                o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=" + e + "&lib=" + t;
                var a = d.getElementsByTagName("script")[0];
                a.parentNode.insertBefore(o, a)
              };

              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
            }(window, document, 'ttq');
          `,
        }}
      />
    </Suspense>
  );
}
