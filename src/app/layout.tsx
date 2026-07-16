import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaRegistration } from "@/components/pwa-registration";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  applicationName: "书脉",
  title: {
    default: "书脉｜沿故事主线读完一本书",
    template: "%s｜书脉",
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: siteConfig.name,
    title: "书脉｜沿故事主线读完一本书",
    description: siteConfig.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "书脉" }],
  },
  twitter: {
    card: "summary",
    title: "书脉｜沿故事主线读完一本书",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  icons: {
    apple: "/pwa-icon/192",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f4" },
    { media: "(prefers-color-scheme: dark)", color: "#111819" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          跳到正文
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SiteFooter />
          <PwaRegistration />
        </ThemeProvider>
        {process.env.VERCEL ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
