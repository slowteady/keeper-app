import React, { createContext, PropsWithChildren, useContext } from 'react';
import { FlatList, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export type FlatListRefType = React.RefObject<FlatList<any>>;
export const ScrollRefContext = createContext<FlatListRefType | null>(null);

export const MapTouchableWrapper = ({ children }: PropsWithChildren) => {
  const flatListRef = useContext(ScrollRefContext);

  const disableScroll = () => {
    if (flatListRef?.current) {
      flatListRef.current.setNativeProps({ scrollEnabled: false });
    }
  };

  const enableScroll = () => {
    if (flatListRef?.current) {
      flatListRef.current.setNativeProps({ scrollEnabled: true });
    }
  };

  const pan = Gesture.Pan()
    .onUpdate(() => {
      console.log(1);
      runOnJS(disableScroll)();
    })
    .onFinalize(() => {
      console.log(2);
    })
    .onEnd(() => {
      console.log(3);
      runOnJS(enableScroll)();
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1 }}>{children}</View>
    </GestureDetector>
  );
};
