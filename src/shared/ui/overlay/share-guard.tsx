import { StyleSheet, View } from 'react-native';

import { useIsSharing } from '@/shared/model';

// Native share sheet 떠 있을 때 underlying view 로 touch 가 새는 race 차단용 fullscreen pointerEvents 흡수 overlay.
// 시각적으로 보이지 않음. share resolve + dismiss 애니메이션 종료까지 mount 유지.
export const ShareGuard = () => {
  const isSharing = useIsSharing();
  if (!isSharing) return null;
  return <View style={StyleSheet.absoluteFill} pointerEvents="auto" />;
};
