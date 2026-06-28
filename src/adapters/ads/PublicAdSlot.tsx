export function PublicAdSlot({ pageType }: { pageType: string }) {
  return (
    <aside className="ad-slot" aria-label="Advertisement placeholder" data-page-type={pageType}>
      Advertising placeholder. Ads are limited to public content shells and do not receive files, passwords, extracted rows, or preview edits.
    </aside>
  );
}
