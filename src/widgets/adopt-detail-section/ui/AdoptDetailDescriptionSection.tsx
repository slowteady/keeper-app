import { Image } from 'expo-image';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { Link } from '@/shared';

export interface Shelter {
  id: number;
  time: string;
  person: string;
  address: string;
  name: string;
}

export interface AdoptDetailDescriptionSectionProps {
  specialMark: string;
  shelter?: Shelter;
}

export const AdoptDetailDescriptionSection = ({ specialMark, shelter }: AdoptDetailDescriptionSectionProps) => {
  const { id, time, person, address, name } = shelter || {};

  const hasShelter = !!name;

  return (
    <>
      <XStack items="center" mb={20}>
        <XStack gap={4} items="center" minW={90}>
          <Text fontSize={18} fontWeight="600" lineHeight={24} color="$black800">
            특징
          </Text>
          <Image
            source={require('@/assets/images/message.png')}
            contentFit="contain"
            style={{ width: 20, height: 20 }}
          />
        </XStack>
        <Text fontSize={16} fontWeight="500" lineHeight={22} color="#7E7E7E" flex={1}>
          {specialMark}
        </Text>
      </XStack>

      <Divider mb={20} />

      <XStack items="center" mb={20}>
        <XStack gap={4} items="center" minW={90}>
          <Text fontSize={18} fontWeight="600" lineHeight={24} color="$black800">
            보호소
          </Text>
          <Image
            source={require('@/assets/images/noticebar.png')}
            contentFit="contain"
            style={{ width: 20, height: 20 }}
          />
        </XStack>

        {hasShelter ? (
          <YStack gap={12} flex={1}>
            {name && <Link url={`/shelter/${id}`} text={name} />}
            {time && <Description>{time}</Description>}
            {person && <Description>{person}</Description>}
            {address && <Description>{address}</Description>}
          </YStack>
        ) : (
          <Description>정보 없음</Description>
        )}
      </XStack>
    </>
  );
};

const Divider = styled(View, {
  height: 1,
  bg: '#EDEDED'
});

const Description = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 18,
  color: '#7E7E7E'
});
