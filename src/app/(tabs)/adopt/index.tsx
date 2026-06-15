import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SceneRendererProps } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { useLoginRequired } from '@/features/auth';
import { RouteErrorBoundary, Tab } from '@/shared/ui';
import { AdoptPersonalScene, AdoptShelterScene, AdoptWriteFab } from '@/widgets/adopt-section';

export const ErrorBoundary = RouteErrorBoundary;

const ADOPT_SOURCE_ROUTES = [
  { key: 'shelter', title: '보호소' },
  { key: 'personal', title: '개인' }
];

const Page = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requireLogin } = useLoginRequired();
  const [index, setIndex] = useState(0);
  const scrollY = useSharedValue(0);

  const navigationState = useMemo(() => ({ index, routes: ADOPT_SOURCE_ROUTES }), [index]);
  const handleIndexChange = useCallback(
    (next: number) => {
      scrollY.value = 0;
      setIndex(next);
    },
    [scrollY]
  );

  const renderScene = useCallback(
    ({ route }: SceneRendererProps & { route: { key: string } }) => {
      switch (route.key) {
        case 'shelter':
          return <AdoptShelterScene scrollY={scrollY} />;
        case 'personal':
          return <AdoptPersonalScene scrollY={scrollY} />;
        default:
          return null;
      }
    },
    [scrollY]
  );

  const handlePressWrite = useCallback(() => {
    requireLogin(() => router.push('/community-write'));
  }, [requireLogin, router]);

  return (
    <Container style={{ paddingTop: insets.top }}>
      <Tab
        tabBarVariant="text"
        onIndexChange={handleIndexChange}
        navigationState={navigationState}
        renderScene={renderScene}
      />
      <AdoptWriteFab onPress={handlePressWrite} scrollY={scrollY} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
