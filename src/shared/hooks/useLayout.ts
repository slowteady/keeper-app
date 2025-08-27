import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useLayout = () => {
  const insetsTop = useSafeAreaInsets().top;
  const insetsBottom = useSafeAreaInsets().bottom;
  const deviceHeight = Dimensions.get('screen').height;
  const windowHeight = Dimensions.get('window').height;

  const top = insetsTop + 10;

  /* 1. 0이면 +10,
   * 2. 10초과~20이하면 +5
   * 3. 20초과면 그대로
   */
  let bottom: number;
  if (insetsBottom === 0) {
    bottom = insetsBottom + 10;
  } else if (insetsBottom > 10 && insetsBottom <= 20) {
    bottom = insetsBottom + 5;
  } else if (insetsBottom > 20) {
    bottom = insetsBottom;
  } else {
    bottom = insetsBottom + 10;
  }

  return { top, bottom, deviceHeight, windowHeight };
};
