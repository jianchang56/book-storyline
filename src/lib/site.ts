const deployedHost =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return new URL("https://read.zeet.me");
  }
  return new URL(
    value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`,
  );
}

export const siteConfig = {
  name: "书脉",
  description: "按原著因果顺序整理故事梗概，让你沿一条清楚的故事线读懂一本书。",
  githubUrl: "https://github.com/jianchang56/book-storyline",
  url: normalizeSiteUrl(deployedHost),
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}
