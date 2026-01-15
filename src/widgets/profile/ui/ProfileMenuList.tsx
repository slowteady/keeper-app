import { router } from 'expo-router';
import { Separator, View, YStack } from 'tamagui';

import { Menu } from '@/shared/ui';

import { MENU_ITEMS } from '../model';

export const ProfileMenuList = () => {
  return (
    <YStack>
      {MENU_ITEMS.map((item, idx) => {
        const key = `${item.label}-${idx}`;

        return (
          <View key={key}>
            <View px={20}>
              <Menu
                icon={<item.icon size={20} />}
                label={item.label}
                onPress={() => router.push({ pathname: `/profile/${item.navigateTo}` })}
              />
            </View>

            {idx !== MENU_ITEMS.length - 1 && <Separator borderColor="$backgroundDefault" />}
          </View>
        );
      })}
    </YStack>
  );
};
