import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useLayout = () => {
  const insetsTop = useSafeAreaInsets().top;
  const insetsBottom = useSafeAreaInsets().bottom;

  let top;
  let bottom = insetsBottom;

  if (Platform.OS === 'ios') {
    top = insetsTop || 59;
  } else if (Platform.OS === 'android') {
    top = insetsTop + 10 || 24;
    bottom = 20;
  }

  return { top, bottom };
};
