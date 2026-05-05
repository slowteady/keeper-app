import { Text, View, YStack } from 'tamagui';

import { Button } from '@/shared/ui';

type ProfileImageSheetProps = {
  onConfirm: () => void;
  bottomInset: number;
};

export const ProfileImageSheet = ({ onConfirm, bottomInset }: ProfileImageSheetProps) => (
  <YStack pt={8} pb={bottomInset} gap={32} flex={1}>
    <YStack gap={12}>
      <Text fontSize={20} fontWeight="600" lineHeight={30} letterSpacing={-0.4} color="$black800">
        프로필 이미지를 등록할까요?
      </Text>
      <Text fontSize={14} fontWeight="400" lineHeight={21} letterSpacing={-0.28} color="$black500">
        {`혐오감을 줄 수 있는 사진을 첨부하면 노출 제한 처리될 수 있습니다\n사진첨부 시 개인정보가 노출되지 않도록 유의해주세요`}
      </Text>
    </YStack>
    <View>
      <Button onPress={onConfirm}>확인</Button>
    </View>
  </YStack>
);
