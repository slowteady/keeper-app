import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { useTheme } from 'tamagui';

export interface BottomSheetLayoutProps extends Omit<BottomSheetModalProps, 'children'> {
  children?: React.ReactNode;
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetLayoutProps>((props, ref) => {
  const { children, ...rest } = props;

  const { white800 } = useTheme();

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      animationConfigs={{ duration: 100 }}
      handleIndicatorStyle={{ width: 48, borderRadius: 30, backgroundColor: white800.val }}
      style={{ paddingHorizontal: 24 }}
      backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      backdropComponent={renderBackdrop}
      {...rest}
    >
      <BottomSheetView style={{ flexDirection: 'column', flex: 1, paddingTop: 12 }}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});

BottomSheet.displayName = 'BottomSheet';
