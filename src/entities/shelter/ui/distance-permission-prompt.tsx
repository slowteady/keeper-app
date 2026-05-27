import { styled, Text, XStack } from 'tamagui';

export const DistancePermissionPrompt = () => {
  return (
    <Container px={16} py={12}>
      <Text fontSize={13} lineHeight={18} fontWeight="500" color="$black600">
        위치 권한을 허용하면 거리별 보호소 수를 볼 수 있어요
      </Text>
    </Container>
  );
};

const Container = styled(XStack, {
  items: 'center',
  justify: 'center',
  bg: '$backgroundDefault',
  rounded: 8
});
