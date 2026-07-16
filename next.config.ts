import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    requestInsights: true,
    serverComponentsHmrCancellation: true,
    turbopackRustReactCompiler: true,
    useTypeScriptCli: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/collections/one-evening",
        destination: "/collections/beyond-the-classroom",
        permanent: true,
      },
      {
        source: "/collections/long-journeys",
        destination: "/collections/four-classics",
        permanent: true,
      },
      {
        source: "/collections/love-and-family",
        destination: "/collections/love-is-not-the-answer",
        permanent: true,
      },
      {
        source: "/collections/adventure-and-epic",
        destination: "/collections/into-the-wider-world",
        permanent: true,
      },
      {
        source: "/collections/fate-and-tragedy",
        destination: "/collections/will-fate-spare-anyone",
        permanent: true,
      },
      {
        source: "/collections/society-and-awakening",
        destination: "/collections/before-becoming-yourself",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
