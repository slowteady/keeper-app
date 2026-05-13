import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetModalProvider
} from '@gorhom/bottom-sheet';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTheme } from 'tamagui';

export type SheetFooterRender = (props: BottomSheetFooterProps) => React.ReactNode;

export type PresentOptions = {
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
  // BottomSheetFooter 로 wrap 된 sticky footer 렌더러 (스크롤 무관 하단 고정, 키보드 대응)
  footerComponent?: SheetFooterRender;
};

export type BottomSheetContextType = {
  present: (node: React.ReactNode, opts?: PresentOptions) => void;
  update: (node: React.ReactNode) => void;
  dismiss: () => void;
  setSnapPoints: (pts: (string | number)[]) => void;
  ref: React.RefObject<BottomSheetModal | null>;
};

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export const BottomSheetProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [snapPoints, setSnapPoints] = useState<(string | number)[]>([200]);
  const [footerRender, setFooterRender] = useState<SheetFooterRender | undefined>(undefined);

  const onDismissRef = useRef<(() => void) | undefined>(undefined);
  const sheetRef = useRef<BottomSheetModal>(null);
  const { white800 } = useTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  const present = useCallback((node: React.ReactNode, opts?: PresentOptions) => {
    if (opts?.snapPoints) setSnapPoints(opts.snapPoints);
    onDismissRef.current = opts?.onDismiss;
    // setState 가 함수를 받으면 updater 로 해석하므로 래핑
    setFooterRender(() => opts?.footerComponent);
    setContent(node);
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);
  const update = useCallback((node: React.ReactNode) => setContent(node), []);
  const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);

  const value = useMemo<BottomSheetContextType>(
    () => ({
      present,
      update,
      dismiss,
      setSnapPoints,
      ref: sheetRef
    }),
    [present, update, dismiss]
  );

  return (
    <BottomSheetModalProvider>
      <BottomSheetContext.Provider value={value}>
        {children}

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          animationConfigs={{ duration: 100 }}
          backdropComponent={renderBackdrop}
          footerComponent={footerRender}
          // 키보드 BP: 시트가 키보드 위로 들리고 (interactive), blur 시 원래 snapPoint 복원
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          handleIndicatorStyle={{ width: 48, borderRadius: 30, backgroundColor: white800.val, marginBottom: 12 }}
          backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          style={{ paddingHorizontal: 24 }}
          onDismiss={() => {
            onDismissRef.current?.();
            onDismissRef.current = undefined;
            setContent(null);
            setFooterRender(undefined);
          }}
          enableDynamicSizing={false}
        >
          {content}
        </BottomSheetModal>
      </BottomSheetContext.Provider>
    </BottomSheetModalProvider>
  );
};

export const useBottomSheet = () => {
  const ctx = useContext(BottomSheetContext);
  if (!ctx) throw new Error('useBottomSheet must be used within <BottomSheetProvider>');
  return ctx;
};
