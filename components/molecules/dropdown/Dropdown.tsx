import { DropDownArrowDownIcon } from '@/components/atoms/icons/ArrowIcon';
import {
  DropdownBottomSheet,
  DropdownBottomSheetMenuData
} from '@/components/organisms/bottomSheet/DropdownBottomSheet';
import theme from '@/constants/theme';
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface DropdownProps<T> extends TouchableOpacityProps {
  data: DropdownBottomSheetMenuData<T>[];
  value: T;
  onChange: (value: DropdownBottomSheetMenuData<T>) => void;
  snapPoints: BottomSheetModalProps['snapPoints'];
}

const Dropdown = <T,>({ data, value, onChange, snapPoints, ...props }: DropdownProps<T>) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) bottomSheetModalRef.current?.dismiss();
  };

  const handleChange = (data: DropdownBottomSheetMenuData<T>) => {
    bottomSheetModalRef.current?.dismiss();
    onChange(data);
  };

  const matchedValue = data.find((item) => item.value === value);

  return (
    <>
      <TouchableOpacity activeOpacity={0.5} style={styles.container} onPress={handlePress} {...props}>
        <Text style={styles.label}>{matchedValue?.name}</Text>
        <DropDownArrowDownIcon color={theme.colors.black[500]} />
      </TouchableOpacity>

      <DropdownBottomSheet ref={bottomSheetModalRef} snapPoints={snapPoints} onAnimate={handleAnimate}>
        <DropdownBottomSheet.Menu data={data} value={value} onPress={handleChange} />
      </DropdownBottomSheet>
    </>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  label: {
    color: theme.colors.black[500],
    ...theme.fonts.regular
  }
});
