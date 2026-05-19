import { ChevronRight } from '@tamagui/lucide-icons';
import * as Application from 'expo-application';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ScrollView, Separator, styled, Text, View, XStack, YStack } from 'tamagui';

import { ConfirmDeleteModal } from '@/features/community/detail/ui/confirm-delete-modal';
import { globalToast } from '@/shared/lib';
import { formatBytes, useCacheSize } from '@/shared/model';
import { Menu, useModal } from '@/shared/ui';

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
      globalToast('캐시 삭제에 실패했어요', 'fail');
    }
  }, [closeModal, refresh]);

  const handlePressClear = useCallback(() => {
    const sizeText = formatBytes(bytes);
    openModal(
      <ConfirmDeleteModal
        title="캐시를 삭제할까요?"
        description={`*저장된 이미지 ${sizeText} 가 비워집니다.`}
        onCancel={closeModal}
        onConfirm={handleConfirmClear}
      />
    );
  }, [bytes, closeModal, handleConfirmClear, openModal]);

  return (
    <Container>
      <ScrollView py={32}>
        <YStack px={20} mb={24}>
          <NavText mb={6}>약관 및 정책</NavText>
          <Menu label="이용약관" style={{ paddingVertical: 14 }} onPress={() => router.push('/terms')} />
          <Menu label="개인정보처리방침" style={{ paddingVertical: 14 }} onPress={() => router.push('/privacy')} />
        </YStack>

        <Separator borderColor="$backgroundDefault" mb={24} />

        <YStack px={20} mb={24}>
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

        <YStack px={20} gap={6}>
          <Label>버전 정보</Label>
          <Text fontSize={14} fontWeight="500" lineHeight={16} letterSpacing={-0.25} color="$white600">
            현재버전 {version}
          </Text>
        </YStack>
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
