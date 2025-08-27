import { DrawerActions } from '@react-navigation/native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useNavigation } from 'expo-router';
import { createStore, Provider } from 'jotai';
import { Pressable } from 'react-native';
import { useTheme, View } from 'tamagui';

import { MainTemplate } from '@/domains/animal/components/templates/MainTemplate';
import { Header } from '@/shared/components';
import { Logo, Menu } from '@/shared/components/atoms/icons/outline';
import { useLayout } from '@/shared/hooks';

/**
 * 메인화면
 */
const Page = () => {
  const store = createStore();
  const { top } = useLayout();

  return (
    <Provider store={store}>
      <Header left={<HeaderLeft />} right={<HeaderRight />} ContainerProps={{ pt: top }} />

      <View flex={1}>
        <MainTemplate />
      </View>
    </Provider>
  );
};

export default Page;

const HeaderLeft = () => {
  const { black900 } = useTheme();

  return <Logo width={96} height={30} color={black900.val} />;
};

const HeaderRight = () => {
  const navigation = useNavigation();
  const { black900 } = useTheme();

  const handlePressDrawer = async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Pressable onPress={handlePressDrawer}>
      <Menu width={24} height={24} color={black900.val} />
    </Pressable>
  );
};
