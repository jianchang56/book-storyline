export const recentPublicationDays = 30;

const dayMs = 24 * 60 * 60 * 1000;

/** 判断书籍是否在最近 recentPublicationDays 天内上架。publishedAt 为空或非法时返回 false。 */
export function isRecentPublication(publishedAt: string, referenceDate: Date): boolean {
  const published = Date.parse(publishedAt);
  if (Number.isNaN(published)) {
    return false;
  }
  const diff = referenceDate.getTime() - published;
  return diff >= 0 && diff <= recentPublicationDays * dayMs;
}

/** 按上架时间从新到旧排序（不稳定字段相同时保持原顺序）。 */
export function compareByPublicationDesc(
  a: { publishedAt: string },
  b: { publishedAt: string },
): number {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}
