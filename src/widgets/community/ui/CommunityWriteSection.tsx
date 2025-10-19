import { useFormContext, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Checkbox, Form, styled, Text, View, XStack, YStack } from 'tamagui';

import {
  COMMUNITY_WRITE_CATEGORY_OPTIONS,
  COMMUNITY_WRITE_CONTACT_INFO_OPTIONS,
  COMMUNITY_WRITE_GENDER_OPTIONS,
  COMMUNITY_WRITE_NEUTER_OPTIONS,
  COMMUNITY_WRITE_PROTECTION_TYPE_OPTIONS,
  COMMUNITY_WRITE_VACCINATION_CHECK_OPTIONS
} from '@/entities';
import { CreatePostFormDto } from '@/features';
import { Button, BUTTON_HEIGHT, Chip, ChipGroup, TextArea, TextField, useLayout } from '@/shared';

export const CommunityWriteSection = () => {
  const { bottom } = useLayout();
  const { setValue, handleSubmit } = useFormContext<CreatePostFormDto>();
  const [animalType, gender, neuterYn, protectionType, vaccinationCheck, contact] = useWatch({
    name: ['animalType', 'gender', 'neuterYn', 'protectionType', 'vaccinationCheck', 'contact']
  });

  const handleChangeContact = (value: string[]) => {
    setValue(
      'contact',
      value.map((item: string) => ({ type: item, value: '' }))
    );
  };

  const onSubmit = (data: CreatePostFormDto) => {
    // TODO: 실제 제출 로직 구현
  };

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={bottom + BUTTON_HEIGHT.large} style={{ flex: 1 }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <KeyboardAwareScrollView
          bottomOffset={bottom + BUTTON_HEIGHT.large + 20}
          contentContainerStyle={{
            paddingTop: 40,
            paddingBottom: bottom + BUTTON_HEIGHT.large + 20
          }}
        >
          <YStack>
            <H1 color="$black900">개인입양 홍보</H1>
            <Caption>*은 필수 표기 정보입니다.</Caption>
          </YStack>

          <Form>
            <YStack px={20} gap={16} mb={40}>
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
                <TextField placeholder="예)5kg" variant="fill" />
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

              <Divider />

              <YStack>
                <SectionTitle title="좋아해요" />
                <TextArea rows={3} variant="fill" minH={70} placeholder="ex) 산책과 드라이브를 좋아해요." />
              </YStack>

              <YStack>
                <SectionTitle title="싫어해요" />
                <TextArea rows={3} variant="fill" minH={70} placeholder="ex) 모르는 사람은 무서워해요." />
              </YStack>

              <YStack>
                <SectionTitle title="아파요" />
                <TextArea
                  rows={3}
                  variant="fill"
                  minH={70}
                  placeholder="ex) 피부병이 있어서 하루에 두 번 연고를 발라줘야해요."
                />
              </YStack>

              <YStack>
                <SectionTitle title="관련 링크" />
                <TextField placeholder="URL" variant="fill" />
              </YStack>

              <YStack>
                <SectionTitle title="RFID" />
                <TextField placeholder="RFID" variant="fill" />
              </YStack>
            </YStack>

            <Divider />

            <YStack px={20} py={32}>
              <XStack items="center" justify="space-between" mb={16}>
                <Text fontWeight="$6" fontSize={17}>
                  커뮤니티 가이드라인을 준수합니다.
                </Text>
                <Checkbox size="$4" checked={true} />
              </XStack>

              <Text fontSize={14} lineHeight={20} fontWeight="$4" color="$black600" mb={16} letterSpacing={-0.25}>
                {
                  '이 가이드라인은 개인 입양 게시판에 반드시 지켜야 할 최소한의 규칙을 담고 있습니다.\n위반 시 게시물 삭제 또는 계정 제재가 이루어질 수 있으니, 글 작성전 꼭 확인해주세요.'
                }
              </Text>

              <Chip text="가이드라인 보기" size="medium" />
            </YStack>
          </Form>
        </KeyboardAwareScrollView>

        <View pb={bottom} position="absolute" b={0} l={0} r={0} px={20} pt={10} bg="$white900">
          <Button onPress={handleSubmit(onSubmit)} size="large">
            등록하기
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const SectionTitle = ({ title, required = false }: { title: string; required?: boolean }) => {
  return (
    <XStack items="baseline" mb={8}>
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
  letterSpacing: -0.25,
  fontSize: 26,
  lineHeight: 36,
  fontWeight: 600,
  mb: 8,
  px: 20
});
const Caption = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
  color: '$black500',
  px: 20,
  mb: 20
});
const Title = styled(Text, {
  fontSize: 17,
  lineHeight: 24,
  fontWeight: 600,
  color: '$blackMain'
});
