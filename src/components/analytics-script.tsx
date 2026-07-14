import Script from "next/script";

export function AnalyticsScript() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) {
    return null;
  }

  return (
    <Script
      id="umami-analytics"
      src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js"}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
