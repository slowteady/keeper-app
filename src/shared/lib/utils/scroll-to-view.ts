import { RefObject } from 'react';
import type { View } from 'react-native';
import { KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';

export const scrollToView = (
  scrollRef: RefObject<KeyboardAwareScrollViewRef | null>,
  viewRef: RefObject<React.ElementRef<typeof View> | null>
) => {
  const scrollView = scrollRef.current;
  const view = viewRef.current;
  if (!scrollView || !view) return false;

  scrollView.scrollResponderScrollNativeHandleToKeyboard(view, 20, true);
  return true;
};
