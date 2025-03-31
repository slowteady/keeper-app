import Button from '@/components/atoms/button/Button';
import { Check } from '@/components/atoms/icons/solid';
import theme from '@/constants/theme';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

export interface BottomSheetLayoutProps extends Omit<BottomSheetModalProps, 'children'> {
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
  renderChildren?: () => React.ReactNode;
}

const Layout = forwardRef<BottomSheetModal, BottomSheetLayoutProps>((props, ref) => {
  const { children, containerStyle, renderChildren, ...rest } = props;

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
      {renderChildren ? (
        renderChildren()
      ) : (
        <BottomSheetView style={[styles.viewContainer, containerStyle]}>{children}</BottomSheetView>
      )}
    </BottomSheetModal>
  );
});

export interface BottomSheetMenuData<T> {
  value: T;
  name: string;
}
export interface BottomSheetMenuProps<T> {
  data: BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
export const Menu = <T,>({ value, data, onPress, style, textStyle }: BottomSheetMenuProps<T>) => {
  return data.map((item, idx) => {
    const { name } = item;
    const key = `${name}-${idx}`;
    const isActive = item.value === value;

    return (
      <Button key={key} style={[styles.button, style]} onPress={() => onPress(item)}>
        <Text style={[styles.text, { color: isActive ? theme.colors.black[800] : theme.colors.black[500] }, textStyle]}>
          {name}
        </Text>
        {isActive && <Check width={17} height={20} color={theme.colors.black[800]} />}
      </Button>
    );
  });
};

export const BottomSheet = Object.assign(Layout, {
  Menu
});

const styles = StyleSheet.create({
  indicator: {
    width: 48,
    borderRadius: 30,
    backgroundColor: theme.colors.white[800]
  },
  innerContainer: {
    paddingHorizontal: 24
  },
  background: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  viewContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingTop: 12
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16
  },
  text: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 19
  }
});

Layout.displayName = 'BottomSheetLayout';
