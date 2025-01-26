import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useLayout = () => {
  const insetsTop = useSafeAreaInsets().top;
  let headerTop;

  if (Platform.OS === 'ios') {
    headerTop = insetsTop || 59;
  } else if (Platform.OS === 'android') {
    headerTop = insetsTop + 10 || 24;
  }

  return { headerTop };
};
