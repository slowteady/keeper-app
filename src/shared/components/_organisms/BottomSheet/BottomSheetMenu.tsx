import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme } from 'tamagui';

import { Check } from '../../_atoms/icons/solid';

export interface BottomSheetMenuData<T> {
  id: T;
  label: string;
}
export interface BottomSheetMenuProps<T> {
  data: BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
}

export const BottomSheetMenu = <T,>({ data, value, onPress }: BottomSheetMenuProps<T>) => {
  const { black800, black500 } = useTheme();

  return data.map((item, idx) => {
    const { label } = item;
    const key = `${label}-${idx}`;
    const isActive = item.id === value;

    return (
      <Pressable key={key} style={[styles.button]} onPress={() => onPress(item)}>
        <StyledText style={[{ color: isActive ? black800.val : black500.val }]}>{label}</StyledText>
        {isActive && <Check width={17} height={20} color={black800.val} />}
      </Pressable>
    );
  });
};

const StyledText = styled(Text, {
  fontSize: 17,
  fontWeight: '500',
  lineHeight: 19
});

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16
  }
});
