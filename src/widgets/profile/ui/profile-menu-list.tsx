import { Separator, View, YStack } from 'tamagui';

import { MENU_ITEMS } from '@/features/profile';
import { Menu } from '@/shared/ui';

type ProfileMenuListProps = {
  items: typeof MENU_ITEMS;
  onSelect: (path: string) => void;
};

export const ProfileMenuList = ({ items, onSelect }: ProfileMenuListProps) => {
  return (
    <YStack>
      {items.map((item, idx) => {
        const key = `${item.label}-${idx}`;

        return (
          <View key={key}>
            <View px={20} py={16} onPress={() => onSelect(item.navigateTo)}>
              <Menu icon={<item.icon size={20} />} label={item.label} />
            </View>

            {idx !== items.length - 1 && <Separator borderColor="$backgroundDefault" />}
          </View>
        );
      })}
    </YStack>
  );
};
