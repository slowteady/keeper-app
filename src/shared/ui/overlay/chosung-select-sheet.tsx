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

import { Search } from '../icons/solid';
import { useBottomSheet } from './bottom-sheet-provider';

type SelectOption = { id: string; label: string };

export type ChosungSelectSheetProps = {
  options: SelectOption[];
  value?: string;
  onSelect: (id?: string) => void;
  searchPlaceholder?: string;
  allLabel?: string;
};

export const ChosungSelectSheet = ({
  options,
  value,
  onSelect,
  searchPlaceholder = '검색',
  allLabel
}: ChosungSelectSheetProps) => {
  const { white900, black900, black500, black700 } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChosung, setActiveChosung] = useState<ChosungLabel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionListRef = useRef<any>(null);
  const { ref: bottomSheetRef } = useBottomSheet();

  useEffect(() => {
    const eventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const sub = Keyboard.addListener(eventName, () => {
      bottomSheetRef.current?.snapToIndex(0);
    });
    return () => sub.remove();
  }, [bottomSheetRef]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, options]);

  const sections = useMemo(() => groupByChosung(filteredOptions, (o) => o.label), [filteredOptions]);

  const availableChosungSet = useMemo(() => new Set(sections.map((s) => s.title)), [sections]);

  const chipJumpTargetRef = useRef<ChosungLabel | null>(null);
  const jumpSectionIndexRef = useRef<number | null>(null);
  const failRetryRef = useRef(0);

  const handleChipPress = (label: ChosungLabel) => {
    const idx = sections.findIndex((s) => s.title === label);
    if (idx < 0) return;
    chipJumpTargetRef.current = label;
    jumpSectionIndexRef.current = idx;
    failRetryRef.current = 0;
    setActiveChosung(label);
    requestAnimationFrame(() => {
      try {
        sectionListRef.current?.scrollToLocation?.({
          sectionIndex: idx,
          itemIndex: 0,
          viewPosition: 0,
          viewOffset: 0,
          animated: true
        });
      } catch {}
    });
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    const sectionTitle = first?.section?.title;
    if (typeof sectionTitle !== 'string') return;

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
        <View style={styles.searchWrap}>
          <BottomSheetTextInput
            placeholder={searchPlaceholder}
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

      {allLabel && !searchQuery.trim() && (
        <TouchableOpacity onPress={() => onSelect(undefined)} style={styles.allRow}>
          <RowText style={{ color: value ? black500.val : black900.val }}>{allLabel}</RowText>
        </TouchableOpacity>
      )}

      <BottomSheetSectionList
        ref={sectionListRef}
        sections={sections}
        style={styles.list}
        keyExtractor={(item: SelectOption, index: number) => `${item.id}-${index}`}
        stickySectionHeadersEnabled={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={11}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }: { item: SelectOption }) => {
          const isActive = item.id === value;
          return (
            <TouchableOpacity onPress={() => onSelect(item.id)} style={styles.row}>
              <RowText style={{ color: isActive ? black900.val : black500.val }}>{item.label}</RowText>
            </TouchableOpacity>
          );
        }}
        renderSectionHeader={({ section }: { section: SectionListData<SelectOption, { title: ChosungLabel }> }) => (
          <View style={{ backgroundColor: white900.val }}>
            <SectionTitle>{section.title}</SectionTitle>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScrollToIndexFailed={() => {
          const sectionIndex = jumpSectionIndexRef.current;
          if (sectionIndex == null || failRetryRef.current >= 6) return;
          failRetryRef.current += 1;
          setTimeout(() => {
            try {
              sectionListRef.current?.scrollToLocation?.({
                sectionIndex,
                itemIndex: 0,
                viewPosition: 0,
                viewOffset: 0,
                animated: false
              });
            } catch {}
          }, 120);
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
  allRow: {
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  list: {
    flex: 1
  },
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
