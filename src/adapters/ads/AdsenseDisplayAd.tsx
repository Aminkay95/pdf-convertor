"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdsenseDisplayAd({ client, slot }: { client: string; slot: string }) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers or review crawlers can block the script; the page should continue rendering.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      data-ad-client={client}
      data-ad-format="auto"
      data-ad-slot={slot}
      data-full-width-responsive="true"
      style={{ display: "block" }}
    />
  );
}
