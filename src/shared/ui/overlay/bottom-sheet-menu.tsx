import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { styled, Text, useTheme, View } from 'tamagui';

import { useLayout } from '@/shared/model';

import { Check } from '../icons/solid';

export type BottomSheetMenuData<T> = {
  id: T;
  label: string;
  destructive?: boolean;
};

export type BottomSheetMenuProps<T> = {
  data: readonly BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
  mode?: 'select' | 'action';
};

export const BottomSheetMenu = <T,>({ data, value, onPress, mode = 'select' }: BottomSheetMenuProps<T>) => {
  const { black800, black500, destructive } = useTheme();
  const { bottom } = useLayout();

  return (
    <View pb={bottom}>
      {data.map((item, idx) => {
        const { label } = item;
        const key = `${label}-${idx}`;
        const isActive = String(item.id) === String(value);
        const showCheck = mode === 'select' && isActive;
        const color = item.destructive ? destructive.val : mode === 'action' || isActive ? black800.val : black500.val;

        return (
          <TouchableOpacity
            key={key}
            style={styles.button}
            onPress={() => onPress(item)}
            accessibilityLabel={label}
            accessibilityRole="button"
            testID={`menu-${String(item.id)}`}
          >
            <StyledText style={{ color }}>{label}</StyledText>
            {showCheck && <Check width={17} height={20} color={black800.val} />}
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingVertical: 12,
    // active 항목엔 Check 아이콘(20px), 그 외엔 텍스트만 — minHeight 통일로 row 간 간격 일치.
    minHeight: 44
  }
});
