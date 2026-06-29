import { styled, Text, View, YStack } from 'tamagui';

import { useHasUnreadNotices } from '@/features/notice';
import { MENU_SECTIONS } from '@/features/profile';
import { SCREEN_GUTTER } from '@/shared/lib';
import { Menu } from '@/shared/ui';

type MenuItem = (typeof MENU_SECTIONS)[number]['items'][number];

type ProfileMenuListProps = {
  sections: typeof MENU_SECTIONS;
  isLoggedIn: boolean;
  onNavigate: (path: string, requireAuth: boolean) => void;
  onReview: () => void;
  onShare: () => void;
};

export const ProfileMenuList = ({ sections, isLoggedIn, onNavigate, onReview, onShare }: ProfileMenuListProps) => {
  const { hasUnread } = useHasUnreadNotices();

  const handlePress = (item: MenuItem) => {
    if ('action' in item) {
      if (item.action === 'review') onReview();
      else if (item.action === 'share') onShare();
      return;
    }
    onNavigate(item.navigateTo, item.requireAuth);
  };

  return (
    <YStack>
      {sections.map((section) => {
        const visibleItems = section.items.filter((item) => isLoggedIn || !('requireAuth' in item && item.requireAuth));
        if (visibleItems.length === 0) return null;

        return (
          <YStack key={section.label} mb={8}>
            <SectionLabel>{section.label}</SectionLabel>
            {visibleItems.map((item, idx) => (
              <View key={`${item.label}-${idx}`} px={SCREEN_GUTTER} py={16} onPress={() => handlePress(item)}>
                <Menu
                  icon={<item.icon size={20} color="$black600" />}
                  label={item.label}
                  showDot={'navigateTo' in item && item.navigateTo === 'notice' && hasUnread}
                />
              </View>
            ))}
          </YStack>
        );
      })}
    </YStack>
  );
};

const SectionLabel = styled(Text, {
  px: 20,
  pt: 20,
  pb: 4,
  fontSize: 13,
  lineHeight: 16,
  fontWeight: '600',
  color: '$black500'
});
