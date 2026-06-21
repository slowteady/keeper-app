import { Dimensions } from 'react-native';
import { styled, XStack, YStack } from 'tamagui';

import { Skeleton } from '@/shared/ui';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const IMAGE_SIZE = SCREEN_WIDTH - 40;

// 커뮤니티 상세 진입 시 본문 자리 placeholder. 댓글창이 먼저 보이는 깜빡임 제거.
export const PostDetailSkeleton = () => {
  return (
    <Container>
      <Header>
        <Skeleton style={styles.avatar} />
        <YStack gap={6}>
          <Skeleton style={styles.nickname} />
          <Skeleton style={styles.time} />
        </YStack>
      </Header>

      <Skeleton style={styles.title} />
      <Skeleton style={styles.titleSecond} />

      <Skeleton style={styles.image} />

      <XStack gap={6}>
        <Skeleton style={styles.chip} />
        <Skeleton style={styles.chip} />
        <Skeleton style={styles.chip} />
      </XStack>

      <YStack gap={6}>
        <Skeleton style={styles.line} />
        <Skeleton style={styles.line} />
        <Skeleton style={styles.lineShort} />
      </YStack>
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  px: 20,
  pt: 32,
  gap: 20
});

const Header = styled(XStack, {
  gap: 12,
  items: 'center'
});

const styles = {
  avatar: { width: 32, height: 32, borderRadius: 8 },
  nickname: { width: 110, height: 14, borderRadius: 4 },
  time: { width: 80, height: 12, borderRadius: 4 },
  title: { width: '85%' as const, height: 22, borderRadius: 4 },
  titleSecond: { width: '60%' as const, height: 22, borderRadius: 4, marginBottom: 8 },
  image: { width: IMAGE_SIZE, height: (IMAGE_SIZE * 4) / 5, borderRadius: 8 },
  chip: { width: 60, height: 22, borderRadius: 4 },
  line: { width: '100%' as const, height: 14, borderRadius: 4 },
  lineShort: { width: '70%' as const, height: 14, borderRadius: 4 }
};
