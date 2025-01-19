import { SearchIcon } from '@/components/atoms/icons/SearchIcon';
import theme from '@/constants/theme';
import { useCallback, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface SearchbarProps extends TextInputProps {
  onSubmit: (text: string) => void;
  ViewStyle?: StyleProp<ViewStyle>;
}
const Searchbar = ({ onSubmit, ViewStyle, style, ...props }: SearchbarProps) => {
  const [value, setValue] = useState('');

  const handleChangeText = useCallback((text: string) => {
    setValue(text);
  }, []);

  const handleSubmit = useCallback(() => {
    if (value) {
      onSubmit(value);
    }

    return null;
  }, [onSubmit, value]);

  return (
    <View style={[styles.searchbar, ViewStyle]}>
      <TextInput
        placeholder="검색어를 입력하세요."
        placeholderTextColor={theme.colors.black[500]}
        keyboardType="default"
        returnKeyType="search"
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        style={[styles.textInput, style]}
        {...props}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.searchButton} activeOpacity={0.5}>
        <SearchIcon width={20} height={20} stroke={theme.colors.black[500]} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

export default Searchbar;

const styles = StyleSheet.create({
  textInput: {
    fontSize: 14,
    fontWeight: '500'
  },
  searchbar: {
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 80,
    justifyContent: 'space-between'
  },
  searchButton: {
    borderRadius: 50
  }
});
