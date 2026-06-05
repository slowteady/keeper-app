import { BottomSheetSectionList, BottomSheetTextInput, TouchableOpacity } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  type SectionListData,
  StyleSheet,
  View as RNView,
  type ViewToken
} from 'react-native';
import { styled, Text, useTheme, View } from 'tamagui';

import { CHOSUNG_LABELS, ChosungLabel, groupByChosung } from '@/shared/lib';
import { useBottomSheet } from '@/shared/ui';
import { Search } from '@/shared/ui/icons/solid';

type KindOption = { id: string; label: string };

export type CreatePostKindBottomSheetProps = {
  kindOption: KindOption[];
  kind: string;
  onSelect: (id: string) => void;
};

export const CreatePostKindBottomSheet = ({ kindOption, kind, onSelect }: CreatePostKindBottomSheetProps) => {
  const { white900, black900, black500, black700 } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChosung, setActiveChosung] = useState<ChosungLabel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionListRef = useRef<any>(null);
  const { ref: bottomSheetRef } = useBottomSheet();

  // keyboardBlurBehavior="restore" 알려진 버그 우회 (@gorhom/bottom-sheet #1894/#2545)
  // snapPoints ['70%'] 단일 — snapToIndex(0) 로 70% 위치 명시 복원
  // iOS 는 willHide (키보드와 sheet 애니메이션 일치), Android 는 didHide fallback
  useEffect(() => {
    const eventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const sub = Keyboard.addListener(eventName, () => {
      bottomSheetRef.current?.snapToIndex(0);
    });
    return () => sub.remove();
  }, [bottomSheetRef]);

  const filteredKindOption = useMemo(() => {
    if (!searchQuery.trim()) return kindOption;
    return kindOption.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, kindOption]);

  const sections = useMemo(() => groupByChosung(filteredKindOption, (o) => o.label), [filteredKindOption]);

  // 자모 chip 활성 여부 — 현재 결과에 해당 자모 항목이 있는지
  const availableChosungSet = useMemo(() => new Set(sections.map((s) => s.title)), [sections]);

  // chip jump 도중 onViewableItemsChanged 가 사이 section 으로 setActiveChosung 호출하는 것 차단.
  // momentum 기반 lock 은 programmatic scroll 에서 불안정 — target ref 로 "타겟 도달 시 자동 해제".
  const chipJumpTargetRef = useRef<ChosungLabel | null>(null);

  const handleChipPress = (label: ChosungLabel) => {
    const idx = sections.findIndex((s) => s.title === label);
    if (idx < 0) return;
    chipJumpTargetRef.current = label;
    setActiveChosung(label);
    // 첫 클릭 시 list 가 아직 layout 측정 안 됐을 수 있어 다음 frame 으로 미룸
    // (RN SectionList scrollToLocation 의 알려진 timing 이슈 — top 미정렬 방지)
    requestAnimationFrame(() => {
      try {
        sectionListRef.current?.scrollToLocation?.({
          sectionIndex: idx,
          itemIndex: 0,
          viewPosition: 0,
          viewOffset: 0,
          animated: true
        });
      } catch {
        // scrollToLocation 실패는 onScrollToIndexFailed 에서 재시도 — 여기선 무시
      }
    });
  };

  // list 스크롤 시 현재 최상단 visible item 의 section.title 로 chip auto-highlight
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    const sectionTitle = first?.section?.title;
    if (typeof sectionTitle !== 'string') return;

    // jump 도중엔 target 도달까지 사이 section 무시. 도달 순간 해제.
    if (chipJumpTargetRef.current) {
      if (sectionTitle === chipJumpTargetRef.current) {
        chipJumpTargetRef.current = null;
      }
      return;
    }

    if ((CHOSUNG_LABELS as readonly string[]).includes(sectionTitle) || sectionTitle === '#') {
      setActiveChosung(sectionTitle as ChosungLabel);
    }
  }).current;

  return (
    <RNView style={styles.container}>
      <RNView style={styles.headerWrap}>
        {/* 검색 input — Figma: 1px 회색 border, white bg, 8px radius, 우측 search 아이콘 */}
        <View style={styles.searchWrap}>
          <BottomSheetTextInput
            placeholder="예)골든 리트리버"
            placeholderTextColor={black500.val}
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              setActiveChosung(null);
            }}
            style={styles.searchInput}
          />
          <View style={styles.searchIcon} pointerEvents="none">
            <Search color={black700.val} width={20} height={20} />
          </View>
        </View>

        {/* 자모 chip row — 가로 작은 화면 대응 위해 horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {CHOSUNG_LABELS.map((label) => {
            const enabled = availableChosungSet.has(label);
            const isActive = activeChosung === label;
            return (
              <TouchableOpacity
                key={label}
                disabled={!enabled}
                onPress={() => handleChipPress(label)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? '#1C1C1C' : '#F3F4F4',
                    opacity: enabled ? 1 : 0.4
                  }
                ]}
              >
                <ChipText style={{ color: isActive ? white900.val : '#7E7E7E' }}>{label}</ChipText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </RNView>

      <BottomSheetSectionList
        ref={sectionListRef}
        sections={sections}
        style={styles.list}
        keyExtractor={(item: KindOption, index: number) => `${item.id}-${index}`}
        stickySectionHeadersEnabled={false}
        initialNumToRender={filteredKindOption.length}
        maxToRenderPerBatch={40}
        windowSize={21}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }: { item: KindOption }) => {
          const isActive = item.id === kind;
          return (
            <TouchableOpacity onPress={() => onSelect(item.id)} style={styles.row}>
              <RowText style={{ color: isActive ? black900.val : black500.val }}>{item.label}</RowText>
            </TouchableOpacity>
          );
        }}
        renderSectionHeader={({ section }: { section: SectionListData<KindOption, { title: ChosungLabel }> }) => (
          <View style={{ backgroundColor: white900.val }}>
            <SectionTitle>{section.title}</SectionTitle>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScrollToIndexFailed={({ index }: { index: number }) => {
          let attempt = 0;
          const retry = () => {
            attempt += 1;
            try {
              sectionListRef.current?.scrollToLocation?.({
                sectionIndex: index,
                itemIndex: 0,
                viewPosition: 0,
                viewOffset: 0,
                animated: false
              });
            } catch {
              // ignore
            }
            if (attempt < 3) setTimeout(retry, 200);
          };
          setTimeout(retry, 200);
        }}
      />
    </RNView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerWrap: {
    backgroundColor: '#fff'
  },
  searchWrap: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D3D9D5',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center'
  },
  searchInput: {
    height: 48,
    paddingHorizontal: 16,
    paddingRight: 44,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1C'
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 20,
    height: 20
  },
  chipRow: {
    paddingVertical: 12,
    gap: 6,
    alignItems: 'center'
  },
  chip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  list: {
    flex: 1
  },
  // 마지막 row 가 sheet 하단에 잘리지 않게 약간의 여유
  listContent: {
    paddingBottom: 24
  }
});

const ChipText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  lineHeight: 17
});

const RowText = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 20
});

const SectionTitle = styled(Text, {
  fontSize: 14,
  fontWeight: '700',
  color: '$black700',
  py: 8,
  px: 4
});
