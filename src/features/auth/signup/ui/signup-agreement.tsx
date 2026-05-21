import { router } from 'expo-router';
import { styled, Text, XStack, YStack } from 'tamagui';

import { Checkbox } from '@/shared/ui';

export type AgreementState = {
  age14: boolean;
  terms: boolean;
  privacy: boolean;
  community: boolean;
};

type SignupAgreementProps = {
  value: AgreementState;
  onChange: (next: AgreementState) => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
  onViewCommunity?: () => void;
};

export const SignupAgreement = ({
  value,
  onChange,
  onViewTerms,
  onViewPrivacy,
  onViewCommunity
}: SignupAgreementProps) => {
  const handleViewTerms = onViewTerms ?? (() => router.push('/terms'));
  const handleViewPrivacy = onViewPrivacy ?? (() => router.push('/privacy'));
  const handleViewCommunity = onViewCommunity ?? (() => router.push('/community-policy'));
  const { age14, terms, privacy, community } = value;
  const allChecked = age14 && terms && privacy && community;

  const toggleAll = (next: boolean) => {
    onChange({ age14: next, terms: next, privacy: next, community: next });
  };

  const setAge14 = (next: boolean) => onChange({ ...value, age14: next });
  const setTerms = (next: boolean) => onChange({ ...value, terms: next });
  const setPrivacy = (next: boolean) => onChange({ ...value, privacy: next });
  const setCommunity = (next: boolean) => onChange({ ...value, community: next });

  return (
    <YStack gap={16} mt={32}>
      <SummaryBox onPress={() => toggleAll(!allChecked)}>
        <Checkbox variant="circle" size={24} checked={allChecked} onChange={toggleAll} />
        <SummaryLabel>약관에 모두 동의합니다</SummaryLabel>
      </SummaryBox>

      <YStack>
        <ItemRow>
          <ItemLeft onPress={() => setAge14(!age14)}>
            <Checkbox variant="icon" size={24} checked={age14} onChange={setAge14} />
            <ItemLabel>(필수) 만 14세 이상입니다</ItemLabel>
          </ItemLeft>
        </ItemRow>

        <ItemRow>
          <ItemLeft onPress={() => setTerms(!terms)}>
            <Checkbox variant="icon" size={24} checked={terms} onChange={setTerms} />
            <ItemLabel>(필수) 이용약관 동의</ItemLabel>
          </ItemLeft>
          <ViewChip onPress={handleViewTerms}>
            <ViewChipText>보기</ViewChipText>
          </ViewChip>
        </ItemRow>

        <ItemRow>
          <ItemLeft onPress={() => setPrivacy(!privacy)}>
            <Checkbox variant="icon" size={24} checked={privacy} onChange={setPrivacy} />
            <ItemLabel>(필수) 개인정보 수집·이용 동의</ItemLabel>
          </ItemLeft>
          <ViewChip onPress={handleViewPrivacy}>
            <ViewChipText>보기</ViewChipText>
          </ViewChip>
        </ItemRow>

        <ItemRow>
          <ItemLeft onPress={() => setCommunity(!community)}>
            <Checkbox variant="icon" size={24} checked={community} onChange={setCommunity} />
            <ItemLabel>(필수) 커뮤니티 가이드라인 동의</ItemLabel>
          </ItemLeft>
          <ViewChip onPress={handleViewCommunity}>
            <ViewChipText>보기</ViewChipText>
          </ViewChip>
        </ItemRow>
      </YStack>
    </YStack>
  );
};

const SummaryBox = styled(XStack, {
  items: 'center',
  gap: 12,
  bg: '$white850',
  px: 16,
  py: 13,
  rounded: 6
});

const SummaryLabel = styled(Text, {
  fontSize: 16,
  lineHeight: 16,
  fontWeight: '600',
  color: '$black800',
  letterSpacing: -0.32
});

const ItemRow = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  py: 8
});

const ItemLeft = styled(XStack, {
  items: 'center',
  gap: 10,
  flex: 1
});

const ItemLabel = styled(Text, {
  fontSize: 15,
  lineHeight: 15,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.15
});

const ViewChip = styled(XStack, {
  items: 'center',
  justify: 'center',
  bg: '$white850',
  px: 8,
  py: 6,
  rounded: 4,
  hitSlop: 6
});

const ViewChipText = styled(Text, {
  fontSize: 13,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.26
});
