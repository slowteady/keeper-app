import { Dimensions } from 'react-native';
import { Route, TabView, TabViewProps } from 'react-native-tab-view';
import { useTheme } from 'tamagui';

import { TabItem } from './TabItem';

const WIDTH = Dimensions.get('screen').width;

export const Tab = <T extends Route>({ ...props }: TabViewProps<T>) => {
  const { black900, black500 } = useTheme();

  return (
    <TabView
      initialLayout={{ width: WIDTH }}
      swipeEnabled={true}
      renderTabBar={(tabBarProps) => (
        <TabItem
          navigationState={tabBarProps.navigationState}
          onIndexChange={props.onIndexChange}
          activeColor={black900.val}
          inactiveColor={black500.val}
        />
      )}
      {...props}
    />
  );
};
