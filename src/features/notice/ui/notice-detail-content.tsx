import { Dimensions, ScrollView } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { NoticeTypeBadge } from '@/entities/notice';
import { formatTimeAgo, SCREEN_GUTTER } from '@/shared/lib';
import { Carousel } from '@/shared/ui';

import { useNoticeDetail } from '../model/use-notice-detail';

export const NoticeDetailContent = ({ id }: { id: string }) => {
  const { data } = useNoticeDetail(id);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <YStack px={SCREEN_GUTTER} pt={20} gap={16}>
        <YStack gap={10}>
          <XStack gap={8} items="center">
            <NoticeTypeBadge type={data.type} />
            <Meta>{formatTimeAgo(data.createdAt)}</Meta>
          </XStack>
          <Title>{data.title}</Title>
        </YStack>
        {data.images.length > 0 && (
          <ImageWrap>
            <Carousel data={data.images} showIndicator showImageViewer imageRadius={10} />
          </ImageWrap>
        )}
        <Body>{data.content}</Body>
      </YStack>
    </ScrollView>
  );
};

const Meta = styled(Text, {
  fontSize: 13,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.26
});

const Title = styled(Text, {
  fontSize: 20,
  fontWeight: '700',
  lineHeight: 28,
  color: '$black900',
  letterSpacing: -0.5
});

const Body = styled(Text, {
  fontSize: 15,
  fontWeight: '400',
  lineHeight: 25,
  color: '$black800',
  letterSpacing: -0.25
});

const ImageWrap = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 5 / 4,
  position: 'relative'
});
