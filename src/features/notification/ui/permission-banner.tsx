import { Bell } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

export type PermissionBannerProps = {
  onPress: () => void;
};

export const PermissionBanner = ({ onPress }: PermissionBannerProps) => {
  return (
    <Container>
      <XStack flex={1} gap={10} items="center" pr={12}>
        <Bell size={20} color="$black700" />
        <YStack flex={1} gap={2}>
          <Title>알림이 꺼져 있어요</Title>
          <Description>중요한 소식을 받으려면 알림을 켜주세요</Description>
        </YStack>
      </XStack>
      <Pressable onPress={onPress}>
        <CtaButton>
          <CtaText>알림 켜기</CtaText>
        </CtaButton>
      </Pressable>
    </Container>
  );
};

const Container = styled(XStack, {
  mx: 20,
  my: 12,
  px: 16,
  py: 14,
  rounded: 12,
  bg: '$white850',
  items: 'center',
  justify: 'space-between'
});

const Title = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 18,
  color: '$black900',
  letterSpacing: -0.28
});

const Description = styled(Text, {
  fontSize: 12,
  fontWeight: '400',
  lineHeight: 16,
  color: '$black500',
  letterSpacing: -0.24
});

const CtaButton = styled(XStack, {
  px: 14,
  py: 8,
  rounded: 8,
  bg: '$black800',
  items: 'center',
  justify: 'center'
});

const CtaText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  color: '$white900'
});
