import { Separator, View, YStack } from 'tamagui';

import { MENU_ITEMS } from '@/features/profile';
import { Menu } from '@/shared/ui';

type ProfileMenuListProps = {
  items: typeof MENU_ITEMS;
  isLoggedIn: boolean;
  onSelect: (path: string, requireAuth: boolean) => void;
};

export const ProfileMenuList = ({ items, isLoggedIn, onSelect }: ProfileMenuListProps) => {
  const visibleItems = items.filter((item) => isLoggedIn || !item.requireAuth);

  return (
    <YStack>
      {visibleItems.map((item, idx) => {
        const key = `${item.label}-${idx}`;

        return (
          <View key={key}>
            <View px={20} py={16} onPress={() => onSelect(item.navigateTo, item.requireAuth)}>
              <Menu icon={<item.icon size={20} />} label={item.label} />
            </View>

            {idx !== visibleItems.length - 1 && <Separator borderColor="$backgroundDefault" />}
          </View>
        );
      })}
    </YStack>
  );
};
