import { Stack } from 'expo-router';

// 입양 탭은 로고 헤더를 두지 않는다 — 하단 5탭이 위치를 알리므로 상단은 출처 탭이 최상단(BP: 당근·무신사·지그재그).
const AdoptLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AdoptLayout;
