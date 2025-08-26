import { Dimensions, StyleSheet } from 'react-native';
import { Route, TabBar, TabBarItem, TabView, TabViewProps } from 'react-native-tab-view';

import { theme } from '@/shared/constants/theme.constants';

export const Tab = <T extends Route>(props: TabViewProps<T>) => {
  const width = Dimensions.get('screen').width;

  return (
    <TabView
      initialLayout={{ width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          bounces
          style={styles.wrapper}
          indicatorStyle={styles.indicator}
          pressOpacity={0.7}
          activeColor={theme.colors.black[900]}
          inactiveColor={theme.colors.black[500]}
          renderTabBarItem={(props) => <TabBarItem {...props} key={props.key} labelStyle={styles.label} />}
        />
      )}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.background.default,
    height: 55,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.white[600],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  indicator: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10,
    height: 3,
    bottom: -3
  },
  label: { fontSize: 17, lineHeight: 19, fontWeight: '500' }
});
