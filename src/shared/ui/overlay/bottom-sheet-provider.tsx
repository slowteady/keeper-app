import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'tamagui';

import { SHEET_BACKGROUND_STYLE, SheetContainer, sheetHandleIndicatorStyle } from './sheet-base';

export type SheetFooterRender = (props: BottomSheetFooterProps) => React.ReactNode;

export type PresentOptions = {
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
  // BottomSheetFooter 로 wrap 된 sticky footer 렌더러 (스크롤 무관 하단 고정, 키보드 대응)
  footerComponent?: SheetFooterRender;
  // true 면 백드롭 탭 / 스와이프 down / 핸들 드래그로 닫히지 않음. 명시적 close() 호출만 닫음.
  // 회원가입 약관 동의처럼 반드시 응답 받아야 하는 시트에 사용.
  mandatory?: boolean;
  // 컨텐츠 height 자동 측정 — 항목 수 가변 list 시트에 사용 (default false)
  enableDynamicSizing?: boolean;
  // dynamic sizing 시 max height (default 화면 70%)
  maxDynamicContentSize?: number;
  // BottomSheetView wrap 비활성화 — content 가 직접 BottomSheetScrollView 등을 wrap 하는 경우
  // (dynamic sizing + 내부 스크롤 케이스 — 중첩 시 스크롤 안 됨)
  disableViewWrap?: boolean;
  // false 면 콘텐츠 영역 드래그가 시트를 움직이지 않음. 내부에 휠 피커처럼
  // 자체 드래그를 쓰는 네이티브 컨트롤이 있을 때 필요 (제스처 가로채기 방지)
  enableContentPanningGesture?: boolean;
};

export type BottomSheetContextType = {
  present: (node: React.ReactNode, opts?: PresentOptions) => void;
  update: (node: React.ReactNode) => void;
  setFooter: (render: SheetFooterRender | undefined) => void;
  dismiss: () => void;
  setSnapPoints: (pts: (string | number)[]) => void;
  ref: React.RefObject<BottomSheetModal | null>;
};

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export const BottomSheetProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [snapPoints, setSnapPoints] = useState<(string | number)[] | undefined>([200]);
  const [footerRender, setFooterRender] = useState<SheetFooterRender | undefined>(undefined);
  const [mandatory, setMandatory] = useState(false);
  const [dynamicSizing, setDynamicSizing] = useState(false);
  const [maxDynamic, setMaxDynamic] = useState<number | undefined>(undefined);
  const [disableViewWrap, setDisableViewWrap] = useState(false);
  const [contentPanning, setContentPanning] = useState(true);

  const onDismissRef = useRef<(() => void) | undefined>(undefined);
  const sheetRef = useRef<BottomSheetModal>(null);
  const { white800 } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={mandatory ? 'none' : 'close'}
      />
    ),
    [mandatory]
  );

  const present = useCallback((node: React.ReactNode, opts?: PresentOptions) => {
    setSnapPoints(opts?.snapPoints);
    setDynamicSizing(!!opts?.enableDynamicSizing);
    setMaxDynamic(opts?.maxDynamicContentSize);
    setDisableViewWrap(!!opts?.disableViewWrap);
    setContentPanning(opts?.enableContentPanningGesture ?? true);
    onDismissRef.current = opts?.onDismiss;
    setMandatory(!!opts?.mandatory);
    // setState 가 함수를 받으면 updater 로 해석하므로 래핑
    setFooterRender(() => opts?.footerComponent);
    setContent(node);
    requestAnimationFrame(() => sheetRef.current?.present());
  }, []);
  const update = useCallback((node: React.ReactNode) => setContent(node), []);
  const setFooter = useCallback((render: SheetFooterRender | undefined) => setFooterRender(() => render), []);
  const dismiss = useCallback(() => sheetRef.current?.dismiss(), []);

  const value = useMemo<BottomSheetContextType>(
    () => ({
      present,
      update,
      setFooter,
      dismiss,
      setSnapPoints,
      ref: sheetRef
    }),
    [present, update, setFooter, dismiss]
  );

  return (
    <BottomSheetContext.Provider value={value}>
      <BottomSheetModalProvider>
        {children}

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          containerComponent={SheetContainer}
          footerComponent={
            footerRender
              ? (props) => (
                  <BottomSheetFooter {...props} bottomInset={bottom}>
                    {footerRender(props)}
                  </BottomSheetFooter>
                )
              : undefined
          }
          // 키보드 BP: 시트가 키보드 위로 들리고 (interactive), blur 시 원래 snapPoint 복원
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          // mandatory 모드: 스와이프 down / 핸들 드래그로 닫히지 않음. dismiss() 호출만 닫음.
          enablePanDownToClose={!mandatory}
          enableHandlePanningGesture={!mandatory}
          enableContentPanningGesture={contentPanning}
          handleComponent={mandatory ? null : undefined}
          handleIndicatorStyle={{ ...sheetHandleIndicatorStyle(white800.val), marginBottom: 12 }}
          backgroundStyle={SHEET_BACKGROUND_STYLE}
          style={{ paddingHorizontal: 24 }}
          onDismiss={() => {
            onDismissRef.current?.();
            onDismissRef.current = undefined;
            setFooterRender(undefined);
            setMandatory(false);
            setDisableViewWrap(false);
            setContentPanning(true);
          }}
          enableDynamicSizing={dynamicSizing}
          maxDynamicContentSize={maxDynamic}
        >
          {disableViewWrap ? (
            content
          ) : (
            <BottomSheetView style={dynamicSizing ? undefined : { flex: 1 }}>{content}</BottomSheetView>
          )}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const ctx = useContext(BottomSheetContext);
  if (!ctx) throw new Error('useBottomSheet must be used within <BottomSheetProvider>');
  return ctx;
};
