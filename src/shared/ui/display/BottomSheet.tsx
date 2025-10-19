import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { theme } from '@/shared/model/constants';

export interface BottomSheetLayoutProps extends Omit<BottomSheetModalProps, 'children'> {
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
  renderChildren?: () => React.ReactNode;
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetLayoutProps>((props, ref) => {
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

BottomSheet.displayName = 'BottomSheet';
