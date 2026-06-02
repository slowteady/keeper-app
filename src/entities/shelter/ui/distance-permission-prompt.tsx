import { styled, Text, View, YStack } from 'tamagui';

import { usePermission } from '@/shared/model';

export const DistancePermissionPrompt = () => {
  const { goSettingMenu } = usePermission();

  return (
    <Container px={16} py={16}>
      <Text fontSize={13} lineHeight={18} fontWeight="500" color="$black600">
        위치 권한을 허용하면 내 주변 보호소를 볼 수 있어요
      </Text>
      <SettingButton onPress={goSettingMenu}>
        <Text fontSize={13} lineHeight={16} fontWeight="600" color="$black900">
          설정에서 허용하기
        </Text>
      </SettingButton>
    </Container>
  );
};

const Container = styled(YStack, {
  items: 'center',
  justify: 'center',
  gap: 12,
  bg: '$backgroundDefault',
  rounded: 8
});

const SettingButton = styled(View, {
  px: 16,
  py: 8,
  rounded: 8,
  borderWidth: 1,
  borderColor: '$white600'
});
