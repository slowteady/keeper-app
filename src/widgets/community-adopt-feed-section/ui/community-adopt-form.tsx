import { UseFormReturn, useWatch } from 'react-hook-form';
import { Accordion, Form, Paragraph, Square, styled, Text, useTheme, View, YStack } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import {
  ContactSelectField,
  LabelImageSelector,
  LabelSelectField,
  LabelTextArea,
  LabelTextField,
  OptionSelectField
} from '@/features/community';
import { DownArrow } from '@/shared/ui/icons/mini';

export type CommunityAdoptFormProps = {
  form: UseFormReturn<CommunityAdoptFormDto>;
  onPressAge: () => void;
  onPressKind: () => void;
  onPressLocation: () => void;
  readOnlyImages?: boolean;
};

export const CommunityAdoptForm = ({
  form,
  onPressAge,
  onPressKind,
  onPressLocation,
  readOnlyImages = false
}: CommunityAdoptFormProps) => {
  const { black500 } = useTheme();

  const { control } = form;

  const weight = useWatch({ control, name: 'weight' });

  return (
    <Form>
      <Caption>*은 필수 표기 정보입니다</Caption>

      {/* ① 사진 — 최상단 (BP) */}
      <Section>
        <LabelImageSelector
          name="images"
          control={control}
          label="이미지 첨부(최대 10장)"
          required
          max={10}
          readOnly={readOnlyImages}
        />
      </Section>

      <Divider />

      {/* ② 공고 정보 */}
      <Section>
        <SectionTitle>공고 정보</SectionTitle>
        <YStack gap={16}>
          <OptionSelectField name="protectionType" control={control} label="보호 유형" required />
          <LabelTextArea
            name="title"
            control={control}
            label="제목"
            required
            maxLength={50}
            rows={3}
            minH={70}
            placeholder="예)말랑말랑 댕댕이의 가족이 되어주세요 :)"
          />
          <LabelTextArea
            name="content"
            control={control}
            label="소개글"
            required
            maxLength={1000}
            rows={6}
            minH={130}
            placeholder="예)성격, 특별한 사연 등을 자유롭게 적어주세요"
          />
          <LabelTextArea
            name="specialMark"
            control={control}
            label="한 줄 요약"
            rows={2}
            minH={80}
            maxLength={100}
            placeholder="예)활발하고 사람을 좋아하는 친구예요"
          />
        </YStack>
      </Section>

      <Divider />

      {/* ③ 아이 정보 */}
      <Section>
        <SectionTitle>아이 정보</SectionTitle>
        <YStack gap={16}>
          <OptionSelectField name="animalType" control={control} label="분류" required />
          <OptionSelectField name="gender" control={control} label="성별" />
          <OptionSelectField name="neuterYn" control={control} label="중성화" />
          <OptionSelectField name="healthCheck" control={control} label="건강검진" />
          <OptionSelectField name="vaccinationCheck" control={control} label="예방접종" />
          <LabelTextField
            label="몸무게"
            name="weight"
            control={control}
            placeholder="예) 3.5"
            value={weight ?? ''}
            keyboardType="decimal-pad"
            maxLength={5}
            right={<Text color="$black500">kg</Text>}
          />
          <LabelSelectField
            name="age"
            control={control}
            label="나이"
            right={<Text color="$black500">년생</Text>}
            placeholder="나이를 선택해주세요"
            onPress={onPressAge}
          />
          <LabelSelectField
            name="location"
            control={control}
            label="지역"
            placeholder="지역을 선택해주세요"
            onPress={onPressLocation}
          />
          <LabelSelectField
            name="specificType"
            control={control}
            label="품종"
            placeholder="품종을 선택해주세요"
            onPress={onPressKind}
          />

          <Accordion type="single" collapsible>
            <Accordion.Item value="optional-section">
              <Accordion.Header>
                <AccordionTrigger>
                  {({ open }: { open: boolean }) => (
                    <>
                      <Paragraph fontSize={14} fontWeight="500" flex={1} color="$black600">
                        추가 정보 적기 (선택)
                      </Paragraph>
                      <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                        <DownArrow width={14} height={14} color={black500.val} />
                      </Square>
                    </>
                  )}
                </AccordionTrigger>
              </Accordion.Header>

              <Accordion.Content bg="transparent" p={0}>
                <Accordion.HeightAnimator animation="quick" exitStyle={{ opacity: 0, height: 0 }}>
                  <YStack gap={16} pt={16}>
                    <LabelTextArea
                      name="likes"
                      control={control}
                      label="좋아해요"
                      rows={3}
                      minH={70}
                      maxLength={100}
                      placeholder="예) 산책과 드라이브를 좋아해요"
                    />
                    <LabelTextArea
                      name="dislikes"
                      control={control}
                      label="싫어해요"
                      rows={3}
                      minH={70}
                      maxLength={100}
                      placeholder="예) 모르는 사람은 무서워해요"
                    />
                    <LabelTextArea
                      name="health"
                      control={control}
                      label="아파요"
                      rows={3}
                      minH={70}
                      maxLength={100}
                      placeholder="예) 피부병이 있어서 하루에 두 번 연고를 발라줘야해요"
                    />
                    <LabelTextField name="relatedLink" control={control} label="관련 링크" placeholder="URL" />
                  </YStack>
                </Accordion.HeightAnimator>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </YStack>
      </Section>

      <Divider />

      {/* ④ 연락처 */}
      <Section>
        <SectionTitle>연락처</SectionTitle>
        <ContactHint>여러 개 선택할 수 있어요</ContactHint>
        <ContactSelectField control={control} label="연락 정보" required />
      </Section>
    </Form>
  );
};

const Section = styled(YStack, {
  px: 20,
  py: 24
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});

const SectionTitle = styled(Text, {
  fontSize: 18,
  fontWeight: '600',
  color: '$blackMain',
  letterSpacing: -0.25,
  mb: 16
});

const ContactHint = styled(Text, {
  fontSize: 13,
  lineHeight: 18,
  color: '$black500',
  mt: -8,
  mb: 12
});

const Caption = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
  color: '$black500',
  px: 20,
  mb: 8
});

const AccordionTrigger = styled(Accordion.Trigger, {
  px: 16,
  py: 12,
  rounded: 4,
  borderWidth: 1,
  borderColor: '$white800',
  flexDirection: 'row',
  items: 'center',
  justify: 'space-between',
  bg: '$white850'
});
