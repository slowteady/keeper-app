import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useLayout = () => {
  const insetsTop = useSafeAreaInsets().top;
  const insetsBottom = useSafeAreaInsets().bottom;

  const deviceHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;

  const top = insetsTop + 10;

  return { top, bottom: insetsBottom, deviceHeight, windowHeight };
};
