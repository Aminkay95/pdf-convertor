import { AdsenseDisplayAd } from "./AdsenseDisplayAd";
import { getGoogleAdsenseClient, getGoogleAdsenseSlot } from "@/content/site";

export function PublicAdSlot({ pageType }: { pageType: string }) {
  const adsenseClient = getGoogleAdsenseClient();
  const adsenseSlot = getGoogleAdsenseSlot();

  if (adsenseClient && adsenseSlot) {
    return (
      <aside className="ad-slot ad-slot-live" aria-label="Advertisement" data-page-type={pageType}>
        <AdsenseDisplayAd client={adsenseClient} slot={adsenseSlot} />
      </aside>
    );
  }

  return (
    <aside className="ad-slot" aria-label="Advertisement placeholder" data-page-type={pageType}>
      Advertising placeholder. Ads are limited to public content shells and do not receive files, passwords, extracted rows, or preview edits.
    </aside>
  );
}
