import { BottomSheetFlatList, BottomSheetTextInput, TouchableOpacity } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View as RNView, type ViewToken } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, Text, useTheme, View } from 'tamagui';

import { CHOSUNG_LABELS, ChosungLabel, groupByChosung } from '@/shared/lib';

import { Search } from '../icons/solid';
import { useBottomSheet } from './bottom-sheet-provider';

type SelectOption = { id: string; label: string };

type FlatRow =
  | { type: 'header'; title: ChosungLabel; key: string }
  | { type: 'item'; title: ChosungLabel; option: SelectOption; key: string };

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 44;

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
  const { bottom } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChosung, setActiveChosung] = useState<ChosungLabel | null>(null);
  const listRef = useRef<{ scrollToIndex: (p: { index: number; viewPosition?: number; animated?: boolean }) => void }>(
    null
  );
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

  const { rows, offsets, headerIndexByTitle } = useMemo(() => {
    const flat: FlatRow[] = [];
    const offs: number[] = [];
    const headerIndex = new Map<ChosungLabel, number>();
    let acc = 0;
    for (const section of sections) {
      headerIndex.set(section.title, flat.length);
      flat.push({ type: 'header', title: section.title, key: `h-${section.title}` });
      offs.push(acc);
      acc += HEADER_HEIGHT;
      section.data.forEach((option, i) => {
        flat.push({ type: 'item', title: section.title, option, key: `${option.id}-${i}` });
        offs.push(acc);
        acc += ROW_HEIGHT;
      });
    }
    return { rows: flat, offsets: offs, headerIndexByTitle: headerIndex };
  }, [sections]);

  const chipJumpTargetRef = useRef<ChosungLabel | null>(null);

  const handleChipPress = (label: ChosungLabel) => {
    const index = headerIndexByTitle.get(label);
    if (index == null) return;
    chipJumpTargetRef.current = label;
    setActiveChosung(label);
    listRef.current?.scrollToIndex({ index, viewPosition: 0, animated: true });
  };

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: rows[index]?.type === 'header' ? HEADER_HEIGHT : ROW_HEIGHT,
      offset: offsets[index] ?? 0,
      index
    }),
    [rows, offsets]
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const title = (viewableItems[0]?.item as FlatRow | undefined)?.title;
    if (!title) return;
    if (chipJumpTargetRef.current) {
      if (title === chipJumpTargetRef.current) chipJumpTargetRef.current = null;
      return;
    }
    setActiveChosung(title);
  }).current;

  const listHeader = (
    <RNView>
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
                style={[styles.chip, { backgroundColor: isActive ? '#1C1C1C' : '#F3F4F4', opacity: enabled ? 1 : 0.4 }]}
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
    </RNView>
  );

  return (
    <>
      {listHeader}
      <BottomSheetFlatList
        ref={listRef as never}
        data={rows}
        style={styles.list}
        keyExtractor={(item: FlatRow) => item.key}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={11}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }: { item: FlatRow }) =>
          item.type === 'header' ? (
            <View style={[styles.sectionHeader, { backgroundColor: white900.val }]}>
              <SectionTitle>{item.title}</SectionTitle>
            </View>
          ) : (
            <TouchableOpacity onPress={() => onSelect(item.option.id)} style={styles.row}>
              <RowText numberOfLines={1} style={{ color: item.option.id === value ? black900.val : black500.val }}>
                {item.option.label}
              </RowText>
            </TouchableOpacity>
          )
        }
        contentContainerStyle={{ paddingBottom: 24 + bottom }}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerWrap: { backgroundColor: '#fff' },
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
  searchIcon: { position: 'absolute', right: 16, top: 14, width: 20, height: 20 },
  chipRow: { paddingVertical: 12, gap: 6, alignItems: 'center' },
  chip: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  allRow: { height: ROW_HEIGHT, justifyContent: 'center', paddingHorizontal: 4 },
  row: { height: ROW_HEIGHT, justifyContent: 'center', paddingHorizontal: 4 },
  sectionHeader: { height: HEADER_HEIGHT, justifyContent: 'center', paddingHorizontal: 4 },
  list: { flex: 1 }
});

const ChipText = styled(Text, { fontSize: 13, fontWeight: '600', lineHeight: 17 });
const RowText = styled(Text, { fontSize: 16, fontWeight: '500', lineHeight: 20 });
const SectionTitle = styled(Text, { fontSize: 14, fontWeight: '700', color: '$black700', lineHeight: 18 });
