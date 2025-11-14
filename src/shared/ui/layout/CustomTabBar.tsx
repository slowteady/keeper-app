import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

import { MENU_ITEMS } from '@/shared/model';

export const CustomTabBar = ({ state, navigation, insets }: BottomTabBarProps) => {
  const theme = useTheme();

  const handlePress = async (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true
    });

    if (!event.defaultPrevented && state.index !== index) {
      await Haptics.selectionAsync();
      navigation.navigate(route.name);
    }
  };

  return (
    <Container>
      <TabItemWrapper pb={insets.bottom}>
        {MENU_ITEMS.map((item, index) => {
          const route = state.routes[index];
          const isActive = state.index === index;

          return (
            <TabItemContainer key={route.key} active={isActive}>
              <TabItemInner onPress={() => handlePress(route, index)}>
                <item.icon
                  width={24}
                  height={24}
                  color={isActive ? theme.black900.val : theme.gray500?.val}
                  fill={isActive ? theme.black900.val : 'none'}
                />
                <TabLabel>{item.label}</TabLabel>
              </TabItemInner>
            </TabItemContainer>
          );
        })}
      </TabItemWrapper>
    </Container>
  );
};

const Container = styled(XStack, {
  bg: '$white900'
});

const TabItemWrapper = styled(XStack, {
  flex: 1,
  px: 16,
  py: 12,
  borderWidth: 1,
  borderColor: '#E9E9E9',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16
});

const TabItemContainer = styled(YStack, {
  flex: 1,
  items: 'center',
  position: 'relative',
  justify: 'center',
  cursor: 'pointer',
  variants: {
    active: {
      true: {
        opacity: 1
      },
      false: {
        opacity: 0.5
      }
    }
  } as const
});

const TabItemInner = styled(YStack, {
  items: 'center',
  justify: 'center',
  gap: 4,
  animation: 'quick',
  pressStyle: {
    scale: 0.9
  }
});

const TabLabel = styled(Text, {
  fontSize: 11,
  lineHeight: 13,
  fontWeight: '600',
  animation: 'quick'
});
