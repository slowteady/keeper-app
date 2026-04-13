import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View } from 'tamagui';

import { useLayout } from '@/shared/model';

import { Check } from '../icons/solid';

export type BottomSheetMenuData<T> = {
  id: T;
  label: string;
};

export type BottomSheetMenuProps<T> = {
  data: readonly BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
};

export const BottomSheetMenu = <T,>({ data, value, onPress }: BottomSheetMenuProps<T>) => {
  const { black800, black500 } = useTheme();
  const { bottom } = useLayout();

  return (
    <View pb={bottom}>
      {data.map((item, idx) => {
        const { label } = item;
        const key = `${label}-${idx}`;
        const isActive = String(item.id) === String(value);

        return (
          <Pressable key={key} style={styles.button} onPress={() => onPress(item)}>
            <StyledText style={[{ color: isActive ? black800.val : black500.val }]}>{label}</StyledText>
            {isActive && <Check width={17} height={20} color={black800.val} />}
          </Pressable>
        );
      })}
    </View>
  );
};

const StyledText = styled(Text, {
  fontSize: 17,
  fontWeight: '500',
  lineHeight: 19
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12
  }
});
