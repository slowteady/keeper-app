import { Text, View, YStack } from 'tamagui';

import { Button } from '@/shared/ui';

type ProfileImageSheetProps = {
  onConfirm: () => void;
  bottomInset: number;
};

export const ProfileImageSheet = ({ onConfirm, bottomInset }: ProfileImageSheetProps) => (
  <>
    <YStack py={16} flex={1}>
      <Text fontSize={20} fontWeight="600" lineHeight={28} color="$black800" mb={12}>
        프로필 이미지를 등록할까요?
      </Text>
      <Text fontSize={14} fontWeight="400" lineHeight={22} letterSpacing={-0.25} color="$black500">
        {`혐오감을 줄 수 있는 사진을 첨부하면 노출 제한 처리될 수 있습니다.\n사진첨부 시 개인정보가 노출되지 않도록 유의해주세요.`}
      </Text>
    </YStack>
    <View mb={bottomInset}>
      <Button onPress={onConfirm}>확인</Button>
    </View>
  </>
);
