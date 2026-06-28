import { Bell } from '@tamagui/lucide-icons';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, XStack, YStack } from 'tamagui';

export type PermissionBannerProps = {
  onPress: () => void;
  icon?: ReactNode;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export const PermissionBanner = ({
  onPress,
  icon = <Bell size={20} color="$black700" />,
  title = '알림이 꺼져 있어요',
  description = '중요한 소식을 받으려면 알림을 켜주세요',
  ctaLabel = '알림 켜기'
}: PermissionBannerProps) => {
  return (
    <Container>
      <XStack flex={1} gap={10} items="center" pr={12}>
        {icon}
        <YStack flex={1} gap={2}>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </YStack>
      </XStack>
      <Pressable onPress={onPress}>
        <CtaButton>
          <CtaText>{ctaLabel}</CtaText>
        </CtaButton>
      </Pressable>
    </Container>
  );
};

const Container = styled(XStack, {
  mx: 20,
  mt: 4,
  mb: 12,
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
