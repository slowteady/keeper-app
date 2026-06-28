import { Dimensions, Pressable, ScrollView } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { NoticeTypeBadge, UrgentNoticeDto } from '@/entities/notice';
import { Button, Carousel } from '@/shared/ui';

const MODAL_WIDTH = Math.round(Dimensions.get('screen').width * 0.85);

export type UrgentNoticeModalProps = {
  notice: UrgentNoticeDto;
  onConfirm: () => void;
  onDismissForever: () => void;
};

export const UrgentNoticeModal = ({ notice, onConfirm, onDismissForever }: UrgentNoticeModalProps) => (
  <Container>
    <YStack gap={16}>
      <YStack gap={10}>
        <NoticeTypeBadge type="URGENT" />
        <Title>{notice.title}</Title>
      </YStack>
      {notice.images.length > 0 && (
        <ImageWrap>
          <Carousel data={notice.images} showIndicator showImageViewer imageRadius={10} />
        </ImageWrap>
      )}
      <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
        <Body>{notice.content}</Body>
      </ScrollView>
      <YStack gap={8} mt={4}>
        <Button onPress={onConfirm}>확인</Button>
        <Pressable onPress={onDismissForever} hitSlop={8}>
          <DismissText>다시 안 보기</DismissText>
        </Pressable>
      </YStack>
    </YStack>
  </Container>
);

const Container = styled(View, {
  width: MODAL_WIDTH,
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 24,
  pb: 16
});

const Title = styled(Text, {
  fontSize: 18,
  fontWeight: '700',
  lineHeight: 25,
  color: '$black900',
  letterSpacing: -0.45
});

const Body = styled(Text, {
  fontSize: 15,
  fontWeight: '400',
  lineHeight: 24,
  color: '$black800',
  letterSpacing: -0.25
});

const ImageWrap = styled(View, {
  width: MODAL_WIDTH - 40,
  height: 180,
  position: 'relative'
});

const DismissText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.28,
  text: 'center',
  py: 8
});
