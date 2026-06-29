import { getGoogleAdsenseClient } from "@/content/site";

export function GET() {
  const adsenseClient = getGoogleAdsenseClient();
  const publisherId = adsenseClient?.replace("ca-", "");
  const body = publisherId ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n` : "";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
