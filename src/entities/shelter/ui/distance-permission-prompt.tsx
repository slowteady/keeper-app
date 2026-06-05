import { MapPin } from '@tamagui/lucide-icons';
import { styled, Text, View, YStack } from 'tamagui';

import { usePermission } from '@/shared/model';

export type DistancePermissionPromptProps = {
  variant?: 'inline' | 'fullscreen';
};

export const DistancePermissionPrompt = ({ variant = 'inline' }: DistancePermissionPromptProps) => {
  const { goSettingMenu } = usePermission();

  if (variant === 'fullscreen') {
    return (
      <FullContainer>
        <IconCircle>
          <MapPin size={30} color="$black700" />
        </IconCircle>
        <YStack gap={8} items="center">
          <Text fontSize={20} lineHeight={28} fontWeight="600" color="$black900" letterSpacing={-0.3}>
            위치 권한이 필요해요
          </Text>
          <Text fontSize={14} lineHeight={20} fontWeight="400" color="$black500" style={{ textAlign: 'center' }}>
            보호소를 지도에서 보려면{'\n'}위치 접근을 허용해주세요
          </Text>
        </YStack>
        <FullButton onPress={goSettingMenu}>
          <FullButtonText>설정에서 허용하기</FullButtonText>
        </FullButton>
      </FullContainer>
    );
  }

  return (
    <Container px={16} py={20}>
      <SmallIconCircle>
        <MapPin size={22} color="$black700" />
      </SmallIconCircle>
      <YStack gap={4} items="center">
        <Text fontSize={15} lineHeight={20} fontWeight="600" color="$black800">
          위치 권한이 필요해요
        </Text>
        <Text fontSize={13} lineHeight={18} fontWeight="400" color="$black500" style={{ textAlign: 'center' }}>
          내 주변 보호소를 지도에서 볼 수 있어요
        </Text>
      </YStack>
      <SettingButton onPress={goSettingMenu}>
        <FullButtonText>설정에서 허용하기</FullButtonText>
      </SettingButton>
    </Container>
  );
};

const Container = styled(YStack, {
  items: 'center',
  justify: 'center',
  gap: 12,
  bg: '$backgroundDefault',
  rounded: 12
});

const FullContainer = styled(YStack, {
  width: '100%',
  items: 'center',
  justify: 'center',
  gap: 24
});

const IconCircle = styled(View, {
  width: 72,
  height: 72,
  rounded: 999,
  bg: '$backgroundDefault',
  items: 'center',
  justify: 'center'
});

const SmallIconCircle = styled(View, {
  width: 48,
  height: 48,
  rounded: 999,
  bg: '$white900',
  items: 'center',
  justify: 'center'
});

const FullButton = styled(View, {
  width: '100%',
  py: 16,
  rounded: 12,
  bg: '$black800',
  items: 'center',
  justify: 'center'
});

const FullButtonText = styled(Text, {
  fontSize: 15,
  lineHeight: 18,
  fontWeight: '600',
  color: '$white900'
});

const SettingButton = styled(View, {
  self: 'center',
  px: 24,
  py: 16,
  rounded: 12,
  bg: '$black800',
  items: 'center',
  justify: 'center'
});
