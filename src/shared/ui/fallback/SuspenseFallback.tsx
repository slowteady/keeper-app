import { ActivityIndicator } from 'react-native';
import { View } from 'tamagui';

export const SuspenseFallback = () => {
  return (
    <View flex={1} items="center" justify="center">
      <ActivityIndicator size="large" color="$black800" />
    </View>
  );
};
