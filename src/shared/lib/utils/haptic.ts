import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

export const toggleHaptic = (isActive: boolean) =>
  impactAsync(isActive ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
