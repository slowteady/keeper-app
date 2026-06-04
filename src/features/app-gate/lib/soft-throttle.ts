import { getItemAsync, setItemAsync } from 'expo-secure-store';

const SOFT_PROMPTED_KEY = 'softUpdatePromptedAt';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const wasSoftPromptedToday = async () => {
  const prompted = await getItemAsync(SOFT_PROMPTED_KEY);
  return prompted === todayKey();
};

export const markSoftPromptedToday = async () => {
  await setItemAsync(SOFT_PROMPTED_KEY, todayKey());
};
