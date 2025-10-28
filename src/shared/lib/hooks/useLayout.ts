import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_BOTTOM = 20;
const MAX_BOTTOM = 30;

export const useLayout = () => {
  const insetsTop = useSafeAreaInsets().top;
  const insetsBottom = useSafeAreaInsets().bottom;

  const deviceHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;

  const top = insetsTop + 10;
  const bottom = Math.min(Math.max(insetsBottom, MIN_BOTTOM), MAX_BOTTOM);

  return { top, bottom, deviceHeight, windowHeight };
};
