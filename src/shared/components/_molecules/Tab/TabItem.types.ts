import { NavigationState, Route } from 'react-native-tab-view';

export type TabItemProps<T extends Route> = {
  navigationState: NavigationState<T>;
  onIndexChange: (index: number) => void;
  activeColor: string;
  inactiveColor: string;
};
