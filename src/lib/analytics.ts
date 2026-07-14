type AnalyticsValue = string | number | boolean;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, AnalyticsValue>) => void;
    };
  }
}

export function trackEvent(eventName: string, data?: Record<string, AnalyticsValue>) {
  if (typeof window === "undefined") {
    return;
  }
  window.umami?.track(eventName, data);
}
