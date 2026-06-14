import { Clock, MapPin, Phone, Stethoscope } from '@tamagui/lucide-icons';
import { styled, Text, useTheme, XStack, YStack } from 'tamagui';

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
  const { black500 } = useTheme();
  const iconColor = black500.val as never;

  return (
    <YStack>
      <Text fontSize={20} fontWeight="600" lineHeight={22} color="$black800" letterSpacing={-0.25} mb={20}>
        보호소 운영정보
      </Text>

      <YStack gap={16}>
        <DescriptionWrap>
          <Clock size={20} color={iconColor} />
          <DescriptionText>{time}</DescriptionText>
        </DescriptionWrap>

        <DescriptionWrap>
          <Phone size={20} color={iconColor} />
          <DescriptionText>{tel}</DescriptionText>
        </DescriptionWrap>

        <DescriptionWrap>
          <Stethoscope size={20} color={iconColor} />
          <DescriptionText>{person}</DescriptionText>
        </DescriptionWrap>

        <DescriptionWrap>
          <MapPin size={20} color={iconColor} />
          <DescriptionText lineHeight={24}>{address}</DescriptionText>
        </DescriptionWrap>
      </YStack>
    </YStack>
  );
};

const DescriptionWrap = styled(XStack, {
  items: 'flex-start',
  gap: 12
});

const DescriptionText = styled(Text, {
  fontSize: 16,
  lineHeight: 22,
  fontWeight: 500,
  color: '#505050',
  letterSpacing: -0.25,
  flex: 1
});
