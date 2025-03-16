import Searchbar from '@/components/molecules/input/Searchbar';
import theme from '@/constants/theme';
import { Address } from '@/types/map';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheet, BottomSheetLayoutProps } from './BottomSheet';

interface LocationBottomSheetProps extends BottomSheetLayoutProps {
  onSubmit: (value: string) => void;
  onPressAddress: (value: Address) => void;
  addresses?: Address[];
}

const LocationBottomSheet = forwardRef<BottomSheetModal, LocationBottomSheetProps>((props, ref) => {
  const { onSubmit, onPressAddress, addresses, ...rest } = props;

  const renderItem = ({ item }: ListRenderItemInfo<Address>) => {
    const { roadAddress } = item;

    return (
      <Pressable style={styles.listButton} onPress={() => onPressAddress(item)}>
        <Text style={styles.listText}>{roadAddress}</Text>
      </Pressable>
    );
  };

  return (
    <BottomSheet
      ref={ref}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      {...rest}
    >
      <Header onSubmit={onSubmit} />
      <FlatList
        keyExtractor={({ roadAddress }, idx) => `${roadAddress}-${idx}`}
        showsVerticalScrollIndicator
        data={addresses}
        renderItem={renderItem}
        ListEmptyComponent={addresses ? <Nodata /> : <></>}
        style={{ marginBottom: 48 }}
      />
    </BottomSheet>
  );
});

export default LocationBottomSheet;

interface HeaderProps {
  onSubmit: (text: string) => void;
}
const Header = ({ onSubmit }: HeaderProps) => {
  const [isFocus, setIsFocus] = useState(false);

  const handleFocus = () => {
    setIsFocus(true);
  };
  const handleBlur = () => {
    setIsFocus(false);
  };

  const searchbarStyle = isFocus ? { borderColor: theme.colors.black[900] } : { borderColor: theme.colors.white[600] };
  const iconStyle = isFocus ? theme.colors.black[900] : theme.colors.white[600];

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>주소검색</Text>
      <Searchbar
        variant="bottomsheet"
        onSubmit={onSubmit}
        placeholder="예)공원로 322"
        onFocus={handleFocus}
        onBlur={handleBlur}
        ViewStyle={[styles.searchbar, searchbarStyle]}
        iconColor={iconStyle}
      />
    </View>
  );
};

const Nodata = () => {
  return <Text>노데이터</Text>;
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
    color: theme.colors.black[800],
    marginBottom: 18
  },
  searchbar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginBottom: 16
  },
  listButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white[800]
  },
  listText: {
    fontSize: 18,
    lineHeight: 20,
    color: theme.colors.black[800]
  }
});

LocationBottomSheet.displayName = 'LocationBottomSheet';
