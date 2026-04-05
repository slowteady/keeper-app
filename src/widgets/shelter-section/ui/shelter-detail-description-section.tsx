import { Image } from 'expo-image';
import { styled, Text, XStack, YStack } from 'tamagui';

export type ShelterDetailDescriptionSectionProps = {
  time: string;
  address: string;
  person: string;
  tel: string;
};

export const ShelterDetailDescriptionSection = ({
  time,
  address,
  person,
  tel
}: ShelterDetailDescriptionSectionProps) => {
  return (
    <YStack>
      <Text fontSize={20} fontWeight="600" lineHeight={22} color="$black800" letterSpacing={-0.25} mb={20}>
        보호소 운영정보
      </Text>

      <YStack gap={16}>
        <DescriptionWrap>
          <Image source={require('@/assets/images/clock.png')} contentFit="contain" style={{ width: 20, height: 20 }} />
          <DescriptionText>{time}</DescriptionText>
        </DescriptionWrap>

        <DescriptionWrap>
          <Image source={require('@/assets/images/phone.png')} contentFit="contain" style={{ width: 20, height: 20 }} />
          <DescriptionText>{tel}</DescriptionText>
        </DescriptionWrap>

        <DescriptionWrap>
          <Image
            source={require('@/assets/images/stethoscope.png')}
            contentFit="contain"
            style={{ width: 20, height: 20 }}
          />
          <DescriptionText>{person}</DescriptionText>
        </DescriptionWrap>

        <DescriptionWrap>
          <Image
            source={require('@/assets/images/noticebar.png')}
            contentFit="contain"
            style={{ width: 20, height: 20 }}
          />
          <DescriptionText lineHeight={24}>{address}</DescriptionText>
        </DescriptionWrap>
      </YStack>
    </YStack>
  );
};

const DescriptionWrap = styled(XStack, {
  items: 'flex-start'
});

const DescriptionText = styled(Text, {
  fontSize: 16,
  lineHeight: 22,
  fontWeight: 500,
  color: '#505050',
  letterSpacing: -0.25,
  ml: 20,
  flex: 1
});
