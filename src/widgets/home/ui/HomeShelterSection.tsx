import { DistanceIndicator } from '@/entities';
import { DownArrow } from '@/shared/ui/icons/mini';
import { router } from 'expo-router';
import { styled, Text, useTheme, View, XStack } from 'tamagui';
import { useHomeShelterSection } from '../model';

export const HomeShelterSection = () => {
  const {} = useHomeShelterSection();

  const { black500 } = useTheme();

  return (
    <>
      <HeaderContainer px={20} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          보호소 찾기
        </Text>
        <XStack items="center" gap={2} mt={12} onPress={() => router.push('/shelter')}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
          <DownArrow width={10} height={6} color={black500.val} transform={[{ rotate: '-90deg' }]} />
        </XStack>
      </HeaderContainer>

      <View px={20} mb={16}>
        <DistanceIndicator value={[]} />
      </View>
    </>
  );
};

const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});
