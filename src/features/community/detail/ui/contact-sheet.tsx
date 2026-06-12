import { Mail, MessageCircle, Phone } from '@tamagui/lucide-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { ContactSafetyNotice } from '@/features/community/safety';
import { globalToast } from '@/shared/lib';
import { useCall, useLayout } from '@/shared/model';

export type ContactType = 'PHONE' | 'EMAIL' | 'SNS';

export type ContactItem = {
  type: ContactType;
  value: string;
};

export type ContactSheetProps = {
  contacts: ContactItem[];
};

export const ContactSheet = ({ contacts }: ContactSheetProps) => {
  const { bottom } = useLayout();
  const { call } = useCall();
  const { black700, black500 } = useTheme();

  const handlePress = async (item: ContactItem) => {
    if (item.type === 'PHONE') {
      await call(item.value);
      return;
    }
    if (item.type === 'EMAIL') {
      try {
        await Linking.openURL(`mailto:${item.value}`);
      } catch {
        await Clipboard.setStringAsync(item.value);
        globalToast('이메일을 복사했어요', 'success');
      }
      return;
    }
    try {
      await Linking.openURL(item.value);
    } catch {
      globalToast('링크를 열 수 없어요', 'fail');
    }
  };

  return (
    <YStack pb={bottom || 16} pt={4}>
      <View mb={8}>
        <ContactSafetyNotice />
      </View>
      {contacts.map((item, idx) => (
        <View key={`${item.type}-${idx}`} style={styles.row}>
          <XStack items="center" gap={12} flex={1} style={{ minWidth: 0 }}>
            <IconBox>{renderIcon(item.type, black700.val)}</IconBox>
            <YStack flex={1} gap={2} style={{ minWidth: 0 }}>
              <Label>{LABEL[item.type]}</Label>
              <Value numberOfLines={1} color={black500.val as never}>
                {item.value}
              </Value>
            </YStack>
          </XStack>
          <Pressable
            onPress={() => handlePress(item)}
            hitSlop={8}
            style={styles.actionButton}
            accessibilityRole="button"
          >
            <ActionText>{ACTION[item.type]}</ActionText>
          </Pressable>
        </View>
      ))}
    </YStack>
  );
};

const LABEL: Record<ContactType, string> = {
  PHONE: '전화로 문의',
  EMAIL: '이메일로 문의',
  SNS: 'SNS 링크'
};

const ACTION: Record<ContactType, string> = {
  PHONE: '전화',
  EMAIL: '메일',
  SNS: '열기'
};

const renderIcon = (type: ContactType, color: string) => {
  const c = color as never;
  if (type === 'PHONE') return <Phone size={20} color={c} />;
  if (type === 'EMAIL') return <Mail size={20} color={c} />;
  return <MessageCircle size={20} color={c} />;
};

const IconBox = styled(View, {
  width: 36,
  height: 36,
  rounded: 18,
  bg: '$white800',
  items: 'center',
  justify: 'center'
});

const Label = styled(Text, {
  fontSize: 15,
  fontWeight: '600',
  color: '$black900',
  lineHeight: 18
});

const Value = styled(Text, {
  fontSize: 13,
  fontWeight: '400',
  lineHeight: 16
});

const ActionText = styled(Text, {
  fontSize: 13,
  fontWeight: '600',
  color: '$black800',
  lineHeight: 15
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7E6',
    backgroundColor: 'transparent'
  }
});
