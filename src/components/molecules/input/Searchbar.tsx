import Button from '@/components/atoms/button/Button';
import { Close } from '@/components/atoms/icons/outline';
import { Search } from '@/components/atoms/icons/solid';
import theme from '@/constants/theme';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import {
  Keyboard,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface SearchbarProps extends TextInputProps {
  variant?: SearchbarVariant;
  onSubmit: (text: string) => void;
  ViewStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
}
export type SearchbarVariant = 'default' | 'bottomsheet';
const Searchbar = ({ variant = 'default', onSubmit, ViewStyle, iconColor, style, ...props }: SearchbarProps) => {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.searchbar, ViewStyle]}>
        {variant === 'default' ? (
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
        ) : (
          <BottomSheetTextInput
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
        )}

        <View style={styles.iconContainer}>
          <Animated.View style={animatedCloseButtonStyle}>
            <Button onPress={handlePressReset}>
              <Close width={24} height={24} color={theme.colors.black[500]} />
            </Button>
          </Animated.View>
          <Button onPress={handleSubmit}>
            <Search width={24} height={24} color={iconColor || theme.colors.black[700]} />
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Searchbar;

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    color: theme.colors.black[800],
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20
  },
  searchbar: {
    height: 48,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 16,
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
