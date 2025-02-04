import theme from '@/constants/theme';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export interface AbandonmentsBottomSheetLayoutProps extends BottomSheetModalProps {
  containerStyle?: ViewStyle;
  children: React.ReactNode;
}

const BottomSheetLayout = forwardRef<BottomSheetModal, AbandonmentsBottomSheetLayoutProps>((props, ref) => {
  const { children, containerStyle, ...rest } = props;

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      animationConfigs={{ duration: 100 }}
      handleIndicatorStyle={styles.indicator}
      style={styles.innerContainer}
      backgroundStyle={styles.background}
      backdropComponent={renderBackdrop}
      {...rest}
    >
      <BottomSheetView style={[styles.viewContainer, containerStyle]}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});

export interface AbandonmentsBottomSheetMenuData<T> {
  value: T;
  name: string;
}
export interface AbandonmentsBottomSheetMenuProps<T> {
  data: AbandonmentsBottomSheetMenuData<T>[];
  value: T;
  onPress: (data: AbandonmentsBottomSheetMenuData<T>) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
export const Menu = <T,>({ value, data, onPress, style, textStyle }: AbandonmentsBottomSheetMenuProps<T>) => {
  return data.map((item, idx) => {
    const { name } = item;
    const key = `${name}-${idx}`;
    const isActive = item.value === value;

    return (
      <TouchableOpacity key={key} activeOpacity={0.5} style={[styles.button, style]} onPress={() => onPress(item)}>
        <Text style={[styles.text, { color: isActive ? theme.colors.black[800] : theme.colors.black[500] }, textStyle]}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  });
};

export const AbandonmentsBottomSheet = Object.assign(BottomSheetLayout, {
  Menu
});

const styles = StyleSheet.create({
  indicator: {
    width: 48,
    borderRadius: 30,
    backgroundColor: theme.colors.white[800]
  },
  innerContainer: {
    paddingHorizontal: 20
  },
  background: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  viewContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  button: {
    paddingVertical: 16
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 18
  }
});

BottomSheetLayout.displayName = 'AbandonmentsBottomSheetLayout';
