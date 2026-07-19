import DateTimePicker from '@react-native-community/datetimepicker';
import { memo, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, useAnimatedValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, Text, View, XStack } from 'tamagui';

export type DateTimeSelectModalProps = {
  open: boolean;
  title: string;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'spinner' | 'compact';
  value: Date;
  confirmText?: string;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

// maximumDate 는 넘기지 않는다 — UIKit 이 값을 상한으로 클램프하면서
// 스크롤 중인 휠을 되돌린다. 미래 일시 차단은 zod 스키마가 담당.
const DateTimeSelectModalBase = ({
  open,
  title,
  mode = 'datetime',
  display = 'compact',
  value,
  confirmText = '완료',
  onConfirm,
  onCancel
}: DateTimeSelectModalProps) => {
  const { bottom } = useSafeAreaInsets();
  const selectedRef = useRef(value);

  const fade = useAnimatedValue(0);
  const slide = useAnimatedValue(1);

  useEffect(() => {
    selectedRef.current = value;
  }, [value]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: open ? 1 : 0, duration: 180, useNativeDriver: true }),
      Animated.spring(slide, { toValue: open ? 0 : 1, useNativeDriver: true, damping: 22, stiffness: 220 })
    ]).start();
  }, [open, fade, slide]);

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', opacity: fade }}>
        <Pressable style={{ flex: 1 }} onPress={onCancel} />
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, 420] }) }] }}
      >
        <Sheet pb={bottom || 16}>
          <Header>
            <Pressable onPress={onCancel} hitSlop={10} accessibilityRole="button">
              <ActionText color="$black500">취소</ActionText>
            </Pressable>
            <Title>{title}</Title>
            <Pressable onPress={() => onConfirm(selectedRef.current)} hitSlop={10} accessibilityRole="button">
              <ActionText color="$blackMain">{confirmText}</ActionText>
            </Pressable>
          </Header>

          <DateTimePicker
            value={value}
            mode={mode}
            display={display}
            onChange={(_event, picked) => {
              if (!picked) return;
              selectedRef.current = picked;
            }}
          />
        </Sheet>
      </Animated.View>
    </Modal>
  );
};

export const DateTimeSelectModal = memo(DateTimeSelectModalBase);

const Sheet = styled(View, {
  bg: '$white900',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  px: 24,
  pt: 8
});

const Header = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  py: 12
});

const Title = styled(Text, {
  fontSize: 16,
  fontWeight: '600',
  lineHeight: 22,
  color: '$blackMain'
});

const ActionText = styled(Text, {
  fontSize: 15,
  fontWeight: '600',
  lineHeight: 22
});
