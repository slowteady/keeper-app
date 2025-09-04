import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTheme } from 'tamagui';

import { BottomSheetContextType, PresentOptions } from './BottomSheetProvider.types';

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export const BottomSheetProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [snapPoints, setSnapPoints] = useState<(string | number)[]>([200]);

  const onDismissRef = useRef<(() => void) | undefined>(undefined);
  const sheetRef = useRef<BottomSheetModal>(null);
  const { white800 } = useTheme();

  const present = useCallback((node: React.ReactNode, opts?: PresentOptions) => {
    if (opts?.snapPoints) setSnapPoints(opts.snapPoints);
    onDismissRef.current = opts?.onDismiss;
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
          index={1}
          snapPoints={snapPoints}
          animationConfigs={{ duration: 100 }}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={'close'} />
          )}
          handleIndicatorStyle={{ width: 48, borderRadius: 30, backgroundColor: white800.val }}
          backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          style={{ paddingHorizontal: 24 }}
          onDismiss={() => {
            onDismissRef.current?.();
            onDismissRef.current = undefined;
            setContent(null);
          }}
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
