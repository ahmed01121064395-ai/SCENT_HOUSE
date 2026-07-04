'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only scroll to top if there is no hash fragment in the URL (to avoid breaking anchor link jumps)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, searchParams]);

  return null;
}
