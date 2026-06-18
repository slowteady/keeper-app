import dayjs from 'dayjs';

const NICKNAME_COOLDOWN_DAYS = 30;
const DAY_MS = 86_400_000;

export const getNicknameCooldownDays = (nicknameUpdatedAt?: string | null): number => {
  if (!nicknameUpdatedAt) return 0;
  const remaining = NICKNAME_COOLDOWN_DAYS * DAY_MS - (Date.now() - new Date(nicknameUpdatedAt).getTime());
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / DAY_MS);
};

export const formatNicknameNextChangeDate = (from: string | Date): string =>
  dayjs(from).add(NICKNAME_COOLDOWN_DAYS, 'day').format('M월 D일');
