import { Search } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, XStack } from 'tamagui';

type ShelterSearchBarProps = {
  onPress: () => void;
};

export const ShelterSearchBar = ({ onPress }: ShelterSearchBarProps) => {
  return (
    <Pressable onPress={onPress}>
      <Bar>
        <Search size={18} color="$black500" />
        <Text fontSize={15} lineHeight={18} fontWeight="400" color="$black500">
          지역·주소로 검색
        </Text>
      </Bar>
    </Pressable>
  );
};

const Bar = styled(XStack, {
  items: 'center',
  gap: 8,
  bg: '$white900',
  rounded: 12,
  px: 16,
  height: 48,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevationAndroid: 3
});
