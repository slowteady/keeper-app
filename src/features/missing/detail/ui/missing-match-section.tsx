import { router } from 'expo-router';
import { ScrollView, styled, Text, XStack, YStack } from 'tamagui';

import { AdoptCard } from '@/entities/adopt';
import { SCREEN_GUTTER } from '@/shared/lib';

import { useMissingMatches } from '../model/use-missing-matches';

export const MissingMatchSection = ({ id }: { id: string }) => {
  const { matches } = useMissingMatches(id);

  if (matches.length === 0) return null;

  return (
    <YStack gap={16}>
      <YStack px={SCREEN_GUTTER} gap={4}>
        <Title>이 아이일 수 있어요</Title>
        <Subtitle>비슷한 시기·지역의 보호 중인 아이예요</Subtitle>
      </YStack>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack px={SCREEN_GUTTER} gap={12}>
          {matches.map((item) => (
            <AdoptCard
              key={item.id}
              horizontal
              uri={item.uri}
              title={item.title}
              description={item.description}
              chips={item.chips}
              status={item.status}
              onPress={() => router.push(`/(untabs)/adopt/${item.id}`)}
            />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
};

const Title = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const Subtitle = styled(Text, {
  fontSize: 13,
  lineHeight: 18,
  fontWeight: 500,
  color: '$black600'
});
