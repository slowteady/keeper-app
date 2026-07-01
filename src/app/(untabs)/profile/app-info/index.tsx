import { ChevronRight } from '@tamagui/lucide-icons';
import * as Application from 'expo-application';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ScrollView, Separator, styled, Text, View, XStack, YStack } from 'tamagui';

import { globalToast, SCREEN_GUTTER } from '@/shared/lib';
import { formatBytes, useCacheSize } from '@/shared/model';
import { ConfirmModal, Menu, useModal } from '@/shared/ui';

const Page = () => {
  const version = Application.nativeApplicationVersion;
  const { open: openModal, close: closeModal } = useModal();
  const { bytes, refresh } = useCacheSize();

  const handleConfirmClear = useCallback(async () => {
    closeModal();
    try {
      await Promise.all([Image.clearDiskCache(), Image.clearMemoryCache()]);
      refresh();
      globalToast('캐시를 삭제했어요', 'success');
    } catch {
      globalToast('캐시를 삭제하지 못했어요', 'fail');
    }
  }, [closeModal, refresh]);

  const handlePressClear = useCallback(() => {
    const sizeText = formatBytes(bytes);
    openModal(
      <ConfirmModal
        title="캐시를 삭제할까요?"
        description={`*저장된 이미지 ${sizeText} 가 비워집니다.`}
        confirmText="삭제하기"
        cancelText="닫기"
        destructive
        onCancel={closeModal}
        onConfirm={handleConfirmClear}
      />
    );
  }, [bytes, closeModal, handleConfirmClear, openModal]);

  return (
    <Container>
      <ScrollView py={32}>
        <YStack px={SCREEN_GUTTER} mb={24}>
          <NavText mb={6}>약관 및 정책</NavText>
          <Menu label="이용약관" style={{ paddingVertical: 14 }} onPress={() => router.push('/terms')} />
          <Menu label="개인정보처리방침" style={{ paddingVertical: 14 }} onPress={() => router.push('/privacy')} />
          <Menu
            label="커뮤니티 가이드라인"
            style={{ paddingVertical: 14 }}
            onPress={() => router.push('/community-guideline')}
          />
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={SCREEN_GUTTER} mb={24}>
          <NavText mb={6}>저장공간</NavText>
          <Pressable style={styles.row} onPress={handlePressClear} hitSlop={12}>
            <Label>캐시 삭제</Label>
            <XStack gap={6} items="center">
              <SizeText>{formatBytes(bytes)}</SizeText>
              <ChevronRight size={21} color="#ADB3AF" />
            </XStack>
          </Pressable>
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={SCREEN_GUTTER} gap={6}>
          <Label>버전 정보</Label>
          <Text fontSize={14} fontWeight="500" lineHeight={16} letterSpacing={-0.25} color="$white600">
            현재버전 {version}
          </Text>
        </YStack>

        <Text
          mt={28}
          px={SCREEN_GUTTER}
          fontSize={13}
          fontWeight="500"
          lineHeight={18}
          letterSpacing={-0.25}
          color="$white600"
        >
          keeper는 수익을 목적으로 운영되지 않습니다.
        </Text>
      </ScrollView>
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Label = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 21,
  color: '$black900',
  letterSpacing: -0.25
});

const NavText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});

const SizeText = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 18,
  letterSpacing: -0.25,
  color: '$black500'
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14
  }
});
