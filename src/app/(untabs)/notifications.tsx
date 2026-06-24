import { BrushCleaning } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { styled, Text, useTheme, View } from 'tamagui';

import { useNotificationFeed } from '@/features/notification';
import { HeaderLayout } from '@/shared/ui';
import { LeftLineArrow } from '@/shared/ui/icons/mini';
import { NotificationFeed } from '@/widgets/notification-feed-section';

const Page = () => {
  const { black900 } = useTheme();
  const feed = useNotificationFeed();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const left = (
    <View onPress={goBack} hitSlop={10}>
      <LeftLineArrow width={24} height={30} color={black900.val} />
    </View>
  );

  const center = (
    <View flex={1} justify="center" items="center">
      <Title>알림</Title>
    </View>
  );

  const right = feed.items.length > 0 && (
    <View onPress={feed.selectMode ? feed.exitSelectMode : feed.enterSelectMode} hitSlop={10}>
      <BrushCleaning size={24} color={feed.selectMode ? '$black900' : '$black400'} />
    </View>
  );

  return (
    <Container>
      <HeaderLayout left={left} center={center} right={right || <View width={24} />} />
      <NotificationFeed feed={feed} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Title = styled(Text, {
  fontSize: 20,
  fontWeight: '500',
  color: '$black900'
});
