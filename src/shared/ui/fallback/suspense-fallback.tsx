import { ActivityIndicator } from 'react-native';
import { useTheme, View } from 'tamagui';

export const SuspenseFallback = () => {
  const { black800 } = useTheme();

  return (
    <View flex={1} items="center" justify="center">
      <ActivityIndicator size="large" color={black800.val} />
    </View>
  );
};
