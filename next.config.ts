import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
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
