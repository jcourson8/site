"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollToTop() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run on route change
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const main = document.querySelector("main");
    main?.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
