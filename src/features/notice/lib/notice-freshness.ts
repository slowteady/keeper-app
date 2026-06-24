const FRESH_MS = 30 * 24 * 60 * 60 * 1000;

export const isNoticeFresh = (createdAt: string) => Date.now() - new Date(createdAt).getTime() <= FRESH_MS;

export const getLatestNotice = <T extends { createdAt: string }>(items: T[]): T =>
  items.reduce((newest, item) => (item.createdAt > newest.createdAt ? item : newest));
