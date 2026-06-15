import { BottomSheetScrollView, TouchableOpacity } from '@gorhom/bottom-sheet';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { styled, Text, useTheme, View, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { SearchInput, useBottomSheet } from '@/shared/ui';
import { Check } from '@/shared/ui/icons/solid';

type SelectOption = { id: string; label: string };

export type SearchableSelectSheetProps = {
  options: SelectOption[];
  value?: string;
  onSelect: (id?: string) => void;
  showSearch?: boolean;
  placeholder?: string;
};

export const SearchableSelectSheet = ({
  options,
  value,
  onSelect,
  showSearch = false,
  placeholder = '검색'
}: SearchableSelectSheetProps) => {
  const { dismiss } = useBottomSheet();
  const { black800, black500 } = useTheme();
  const { bottom } = useLayout();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => (showSearch && query ? options.filter((o) => o.label.includes(query)) : options),
    [options, query, showSearch]
  );

  const pick = (id?: string) => {
    onSelect(id);
    dismiss();
  };

  const rows: SelectOption[] = [{ id: '', label: '전체' }, ...filtered];

  return (
    <YStack height="100%">
      {showSearch && (
        <View pt={8} pb={4}>
          <SearchInput placeholder={placeholder} value={query} onTextChange={setQuery} />
        </View>
      )}
      <BottomSheetScrollView
        contentContainerStyle={{ paddingTop: 4, paddingBottom: bottom + 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {rows.map((o) => {
          const active = (o.id || undefined) === value;
          return (
            <TouchableOpacity key={o.id || 'all'} style={styles.row} onPress={() => pick(o.id || undefined)}>
              <RowText style={{ color: active ? black800.val : black500.val }}>{o.label}</RowText>
              {active && <Check width={17} height={20} color={black800.val} />}
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </YStack>
  );
};

const RowText = styled(Text, {
  fontSize: 17,
  fontWeight: '500',
  lineHeight: 19
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 44
  }
});
