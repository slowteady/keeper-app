import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Dimensions } from 'react-native';

import { BottomSheetMenu, BottomSheetMenuData } from './bottom-sheet-menu';
import { useBottomSheet } from './bottom-sheet-provider';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
// 항목이 많아도 시트가 화면 70% 를 넘지 않도록 cap — 초과 시 내부 ScrollView 가 처리
const MAX_DYNAMIC_CONTENT_SIZE = WINDOW_HEIGHT * 0.7;

export type UseBottomSheetMenuOptions<T> = {
  data: readonly BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
  // true 면 선택 후 자동 닫힘 (default true)
  dismissOnPress?: boolean;
};

export const useBottomSheetMenu = <T,>({
  data,
  value,
  onPress,
  dismissOnPress = true
}: UseBottomSheetMenuOptions<T>) => {
  const { present, dismiss } = useBottomSheet();

  const open = () => {
    present(
      // BottomSheetScrollView + maxHeight 로 wrap — enableDynamicSizing 모드에선
      // ScrollView 자체 maxHeight 가 필수 (없으면 컨텐츠 전체 측정해서 스크롤 안 됨)
      <BottomSheetScrollView style={{ maxHeight: MAX_DYNAMIC_CONTENT_SIZE }}>
        <BottomSheetMenu
          data={data}
          value={value}
          onPress={(item) => {
            onPress(item);
            if (dismissOnPress) dismiss();
          }}
        />
      </BottomSheetScrollView>,
      {
        enableDynamicSizing: true,
        maxDynamicContentSize: MAX_DYNAMIC_CONTENT_SIZE,
        // BottomSheetScrollView 직접 wrap — Provider 의 BottomSheetView 중첩 시 내부 스크롤 안 됨
        disableViewWrap: true
      }
    );
  };

  return { open };
};
