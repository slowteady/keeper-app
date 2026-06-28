import { getItemAsync, setItemAsync } from 'expo-secure-store';

import { logger } from '@/shared/lib';

const READ_KEY = 'noticeReadIds';
const URGENT_DISMISSED_KEY = 'noticeUrgentDismissedIds';

const readArray = async (key: string): Promise<string[]> => {
  try {
    const raw = await getItemAsync(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    logger.error('failed to read notice ids', e);
    return [];
  }
};

const appendId = async (key: string, id: string): Promise<string[]> => {
  const ids = await readArray(key);
  if (ids.includes(id)) return ids;
  const next = [...ids, id];
  try {
    await setItemAsync(key, JSON.stringify(next));
  } catch (e) {
    logger.error('failed to persist notice ids', e);
  }
  return next;
};

export const getReadNoticeIds = () => readArray(READ_KEY);

export const addReadNoticeId = (id: string) => appendId(READ_KEY, id);

export const isUrgentNoticeDismissed = async (id: string) => (await readArray(URGENT_DISMISSED_KEY)).includes(id);

export const markUrgentNoticeDismissed = async (id: string) => {
  await appendId(URGENT_DISMISSED_KEY, id);
};
