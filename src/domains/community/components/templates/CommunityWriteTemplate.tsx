import { useFormContext, useWatch } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Form, styled, Text, View, XStack, YStack } from 'tamagui';

import { CommunityWriteForm } from '@/app/(home)/(public)/community/write';
import { Button, ChipGroup, TextArea, TextField } from '@/shared/components/_atoms';
import { useLayout } from '@/shared/hooks';

import {
  COMMUNITY_WRITE_CATEGORY_OPTIONS,
  COMMUNITY_WRITE_CONTACT_INFO_OPTIONS,
  COMMUNITY_WRITE_GENDER_OPTIONS,
  COMMUNITY_WRITE_NEUTER_OPTIONS,
  COMMUNITY_WRITE_PROTECTION_TYPE_OPTIONS,
  COMMUNITY_WRITE_VACCINATION_CHECK_OPTIONS
} from '../../constants';

export const CommunityWriteTemplate = () => {
  const { bottom } = useLayout();
  const { setValue } = useFormContext<CommunityWriteForm>();
  const [animalType, gender, neuterYn, protectionType, vaccinationCheck, contact] = useWatch({
    name: ['animalType', 'gender', 'neuterYn', 'protectionType', 'vaccinationCheck', 'contact']
  });

  const handleChangeContact = (value: string[]) => {
    setValue(
      'contact',
      value.map((item: string) => ({ type: item, value: '' }))
    );
  };

  return (
    <KeyboardAwareScrollView bottomOffset={bottom} contentContainerStyle={{ paddingTop: 40, paddingBottom: bottom }}>
      <YStack>
        <H1 color="$black900">개인입양 홍보</H1>
        <Divider mb={20} />
        <Caption>*은 필수 표기 정보입니다.</Caption>
      </YStack>

      <Form>
        <YStack px={20} gap={20} mb={40}>
          <YStack>
            <SectionTitle title="분류" required />
            <ChipGroup
              variant="secondary"
              isPressable
              value={animalType}
              onChange={(value) => setValue('animalType', value)}
              options={COMMUNITY_WRITE_CATEGORY_OPTIONS}
            />
          </YStack>

          <YStack>
            <SectionTitle title="성별" required />
            <ChipGroup
              variant="secondary"
              isPressable
              value={gender}
              onChange={(value) => setValue('gender', value)}
              options={COMMUNITY_WRITE_GENDER_OPTIONS}
            />
          </YStack>

          <YStack>
            <SectionTitle title="중성화 여부" required />
            <ChipGroup
              variant="secondary"
              isPressable
              value={neuterYn}
              onChange={(value) => setValue('neuterYn', value)}
              options={COMMUNITY_WRITE_NEUTER_OPTIONS}
            />
          </YStack>

          <YStack>
            <SectionTitle title="보호 유형" required />
            <ChipGroup
              variant="secondary"
              isPressable
              value={protectionType}
              onChange={(value) => setValue('protectionType', value)}
              options={COMMUNITY_WRITE_PROTECTION_TYPE_OPTIONS}
            />
          </YStack>

          <YStack>
            <SectionTitle title="예방접종" required />
            <ChipGroup
              variant="secondary"
              isPressable
              value={vaccinationCheck}
              onChange={(value) => setValue('vaccinationCheck', value)}
              options={COMMUNITY_WRITE_VACCINATION_CHECK_OPTIONS}
            />
          </YStack>

          <YStack>
            <SectionTitle title="몸무게" required />
            <TextField placeholder="예)5kg" variant="fill" disabled />
          </YStack>

          <YStack>
            <SectionTitle title="지역" required />
            <XStack gap={8}>
              <TextField placeholder="예)서울특별시" variant="fill" />
              <Button color="secondary" size="small" style={{ width: 60 }}>
                검색
              </Button>
            </XStack>
          </YStack>

          <YStack>
            <SectionTitle title="종류" required />
            <TextField placeholder="예)말티즈" variant="fill" />
          </YStack>

          <YStack>
            <SectionTitle title="나이" required />
            <TextField placeholder="예)2025년생" variant="fill" />
          </YStack>

          <YStack>
            <SectionTitle title="특징" required />
            <TextArea rows={6} variant="fill" minH={130} />
          </YStack>

          <YStack>
            <SectionTitle title="소개글" required />
            <TextArea rows={6} variant="fill" minH={130} placeholder="ex)동물의 간단한 소개를 입력해주세요." />
          </YStack>

          <YStack>
            <SectionTitle title="연락 정보" required />
            <View mb={12}>
              <ChipGroup
                variant="secondary"
                multiple
                options={COMMUNITY_WRITE_CONTACT_INFO_OPTIONS}
                isPressable
                value={contact.map((item: { type: string }) => item.type)}
                onChange={handleChangeContact}
              />
            </View>
            <YStack gap={12}>
              {contact.map((item: { type: string }, idx: number) => (
                <TextField placeholder={item.type} variant="fill" key={`${item.type}-${idx}`} />
              ))}
            </YStack>
          </YStack>

          <YStack>
            <SectionTitle title="관련 링크" required />
            <TextField placeholder="URL" variant="fill" />
          </YStack>

          <YStack>
            <SectionTitle title="RFID" />
            <TextField placeholder="RFID" variant="fill" />
          </YStack>
        </YStack>

        <Divider />
      </Form>
    </KeyboardAwareScrollView>
  );
};

const SectionTitle = ({ title, required = false }: { title: string; required?: boolean }) => {
  return (
    <XStack items="baseline" mb={12}>
      <Title>{title}</Title>
      {required && (
        <Text color="$primaryMain" fontSize={20}>
          *
        </Text>
      )}
    </XStack>
  );
};

const Divider = styled(View, {
  height: 1,
  bg: '$white800'
});
const H1 = styled(Text, {
  fontSize: 26,
  lineHeight: 36,
  fontWeight: 700,
  mb: 20,
  px: 20
});
const Caption = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
  px: 20,
  color: '$black500',
  mb: 16
});
const Title = styled(Text, {
  fontSize: 18,
  lineHeight: 20,
  fontWeight: 700,
  color: '$blackMain'
});
