import { CloseIcon } from '@/components/atoms/icons/CloseIcon';
import { SearchIcon } from '@/components/atoms/icons/SearchIcon';
import theme from '@/constants/theme';
import { useCallback, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface SearchbarProps extends TextInputProps {
  onSubmit: (text: string) => void;
  ViewStyle?: StyleProp<ViewStyle>;
}
const Searchbar = ({ onSubmit, ViewStyle, style, ...props }: SearchbarProps) => {
  const [value, setValue] = useState('');
  const closeButtonOpacity = useSharedValue(0);

  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
      closeButtonOpacity.value = text.length > 0 ? 1 : 0;
    },
    [closeButtonOpacity]
  );

  const handleSubmit = () => {
    onSubmit(value);
  };

  const handlePressReset = () => {
    setValue('');
    closeButtonOpacity.value = 0;
  };

  const animatedCloseButtonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(closeButtonOpacity.value, { duration: 200 }),
    transform: [{ scale: withTiming(closeButtonOpacity.value, { duration: 200 }) }]
  }));

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

      <View style={styles.iconContainer}>
        <Animated.View style={animatedCloseButtonStyle}>
          <TouchableOpacity onPress={handlePressReset}>
            <CloseIcon width={24} height={24} color={theme.colors.black[500]} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.5}>
          <SearchIcon width={20} height={20} color={theme.colors.black[700]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Searchbar;

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    color: theme.colors.black[800],
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 17
  },
  searchbar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'space-between'
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8
  }
});
