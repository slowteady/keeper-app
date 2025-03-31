import { DownArrow } from '@/components/atoms/icons/mini';
import { BottomSheet, BottomSheetMenuData } from '@/components/organisms/bottomSheet/BottomSheet';
import theme from '@/constants/theme';
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface DropdownProps<T> extends TouchableOpacityProps {
  data: BottomSheetMenuData<T>[];
  value: T;
  onChange: (value: BottomSheetMenuData<T>) => void;
  snapPoints: BottomSheetModalProps['snapPoints'];
}

const Dropdown = <T,>({ data, value, onChange, snapPoints, ...props }: DropdownProps<T>) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === -1) bottomSheetModalRef.current?.dismiss();
  };
  const handleChange = (data: BottomSheetMenuData<T>) => {
    bottomSheetModalRef.current?.dismiss();
    onChange(data);
  };

  const matchedValue = data.find((item) => item.value === value);

  return (
    <>
      <TouchableOpacity activeOpacity={0.5} style={styles.container} onPress={handlePress} {...props}>
        <Text style={styles.label}>{matchedValue?.name}</Text>
        <DownArrow width={10} height={6} color={theme.colors.black[500]} />
      </TouchableOpacity>

      <BottomSheet ref={bottomSheetModalRef} snapPoints={snapPoints} onAnimate={handleAnimate}>
        <BottomSheet.Menu data={data} value={value} onPress={handleChange} />
      </BottomSheet>
    </>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  label: {
    color: theme.colors.black[500],
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21
  }
});
