import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useLayout = () => {
  const { top: insetsTop, bottom } = useSafeAreaInsets();

  return { top: insetsTop + 10, bottom };
};
