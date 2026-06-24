import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

export const toggleHaptic = (isActive: boolean) =>
  impactAsync(isActive ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);

export const pressHaptic = () => impactAsync(ImpactFeedbackStyle.Light).catch(() => undefined);
