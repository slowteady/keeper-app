import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { useTheme } from 'tamagui';

import { SHEET_BACKGROUND_STYLE, SheetContainer, sheetHandleIndicatorStyle } from './sheet-base';

export interface BottomSheetLayoutProps extends Omit<BottomSheetModalProps, 'children'> {
  children?: React.ReactNode;
  disableViewWrap?: boolean;
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetLayoutProps>((props, ref) => {
  const { children, disableViewWrap, ...rest } = props;

  const { white800 } = useTheme();

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing={false}
      handleIndicatorStyle={sheetHandleIndicatorStyle(white800.val)}
      style={{ paddingHorizontal: 24 }}
      backgroundStyle={SHEET_BACKGROUND_STYLE}
      backdropComponent={renderBackdrop}
      containerComponent={SheetContainer}
      {...rest}
    >
      {disableViewWrap ? (
        children
      ) : (
        <BottomSheetView style={{ flexDirection: 'column', flex: 1, paddingTop: 12 }}>{children}</BottomSheetView>
      )}
    </BottomSheetModal>
  );
});

BottomSheet.displayName = 'BottomSheet';
