import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { Button, useBottomSheet, useModal } from '@/shared/ui';

export const useAccount = () => {
  const { bottom } = useSafeAreaInsets();
  const { present, dismiss } = useBottomSheet();
  const { open, close } = useModal();

  const pickImage = useCallback(async () => {
    dismiss();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets?.[0]) {
      const imageUri = result.assets[0].uri;
      // TODO: 여기서 프로필 이미지 업로드 API 호출
      console.log('Selected image:', imageUri);
    }
  }, [dismiss]);

  const changeProfileImage = useCallback(() => {
    present(
      <>
        <YStack py={16} flex={1}>
          <Text fontSize={20} fontWeight="600" lineHeight={28} color="$black800" mb={12}>
            프로필 이미지를 등록할까요?
          </Text>
          <Text fontSize={14} fontWeight="400" lineHeight={22} letterSpacing={-0.25} color="$black500">
            {`혐오감을 줄 수 있는 사진을 첨부하면 노출 제한 처리될 수 있습니다.\n사진첨부 시 개인정보가 노출되지 않도록 유의해주세요.`}
          </Text>
        </YStack>

        <View mb={bottom}>
          <Button onPress={pickImage}>확인</Button>
        </View>
      </>,
      { snapPoints: [240] }
    );
  }, [bottom, pickImage, present]);

  const openWithdrawModal = useCallback(
    (onWithdraw: () => void) => {
      const modalContent = (
        <Container>
          <Text fontSize={17} fontWeight="600" color="$black800" lineHeight={20} mb={12}>
            정말 탈퇴하실건가요?
          </Text>
          <Text mb={32} fontSize={14} fontWeight="400" color="$black500" lineHeight={19}>
            탈퇴 후 계정 복구는 불가합니다.
          </Text>

          <XStack gap={6}>
            <ModalButton onPress={close} bg="$white800">
              <ModalButtonText>취소</ModalButtonText>
            </ModalButton>

            <ModalButton
              onPress={() => {
                onWithdraw();
                close();
              }}
              bg="$errorMain"
            >
              <ModalButtonText color="$white900">탈퇴하기</ModalButtonText>
            </ModalButton>
          </XStack>
        </Container>
      );

      open(modalContent);
    },
    [close, open]
  );

  return { changeProfileImage, openWithdrawModal };
};

const Container = styled(View, {
  width: '80%',
  rounded: 18,
  bg: '$white900',
  px: 20,
  pt: 32,
  pb: 16
});

const ModalButton = styled(View, {
  rounded: 10,
  py: 16,
  flex: 1
});

const ModalButtonText = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 16,
  text: 'center',
  color: '$black800'
});
