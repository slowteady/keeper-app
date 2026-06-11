import { RefObject } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { LayoutChangeEvent, TextInput } from 'react-native';
import { Accordion, Form, Paragraph, Square, styled, Text, useTheme, View, YStack } from 'tamagui';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';
import { ContactSelectField } from '@/features/community/create/ui/field/contact-select-field';
import { LabelChipGroup } from '@/features/community/create/ui/field/label-chip-group';
import { LabelImageSelector } from '@/features/community/create/ui/field/label-image-selector';
import { LabelSelectField } from '@/features/community/create/ui/field/label-select-field';
import { LabelTextArea } from '@/features/community/create/ui/field/label-text-area';
import { LabelTextField } from '@/features/community/create/ui/field/label-text-field';
import { OptionSelectField } from '@/features/community/create/ui/field/option-select-field';
import { DownArrow } from '@/shared/ui/icons/mini';

export type CommunityAdoptFormProps = {
  form: UseFormReturn<CommunityAdoptFormDto>;
  onPressAge: () => void;
  onPressKind: () => void;
  onPressLocation: () => void;
  readOnlyImages?: boolean;
  fieldRefs?: {
    images?: RefObject<React.ElementRef<typeof View> | null>;
    contactInput?: RefObject<TextInput | null>;
  };
  onContactLayout?: (event: LayoutChangeEvent) => void;
};

export const CommunityAdoptForm = ({
  form,
  onPressAge,
  onPressKind,
  onPressLocation,
  readOnlyImages = false,
  fieldRefs,
  onContactLayout
}: CommunityAdoptFormProps) => {
  const { black500 } = useTheme();
  const { control } = form;
  const weight = useWatch({ control, name: 'weight' });

  return (
    <Form>
      <Caption>*은 필수 표기 정보입니다</Caption>

      <Section ref={fieldRefs?.images}>
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

      <Section>
        <SectionTitle>공고 정보</SectionTitle>
        <YStack gap={16}>
          <OptionSelectField name="protectionType" control={control} label="보호 유형" required />
          <OptionSelectField name="animalType" control={control} label="분류" required />
          <LabelTextArea
            name="title"
            control={control}
            label="제목"
            required
            maxLength={50}
            rows={3}
            minH={70}
            placeholder="예) 말랑말랑 댕댕이의 가족이 되어주세요 :)"
          />
          <LabelTextArea
            name="content"
            control={control}
            label="소개글"
            required
            maxLength={1000}
            rows={6}
            minH={130}
            placeholder="예) 사람을 잘 따르고 배변을 가리는 2살 강아지예요"
          />
        </YStack>
      </Section>

      <Divider />

      <Accordion type="single" collapsible>
        <Accordion.Item value="child-info">
          <Accordion.Header unstyled>
            <AccordionSectionTrigger unstyled>
              {({ open }: { open: boolean }) => (
                <>
                  <SectionTitle mb={0}>아이 정보 (선택)</SectionTitle>
                  <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                    <DownArrow width={16} height={16} color={black500.val} />
                  </Square>
                </>
              )}
            </AccordionSectionTrigger>
          </Accordion.Header>
          <Accordion.Content bg="transparent" p={0}>
            <Accordion.HeightAnimator animation="quick" exitStyle={{ opacity: 0, height: 0 }}>
              <YStack px={20} pb={24} gap={16}>
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
                    <Accordion.Header unstyled>
                      <AccordionTrigger unstyled>
                        {({ open }: { open: boolean }) => (
                          <>
                            <Paragraph fontSize={14} lineHeight={20} fontWeight="500" flex={1} color="$black600">
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
                            name="health"
                            control={control}
                            label="아파요"
                            rows={3}
                            minH={70}
                            maxLength={100}
                            placeholder="예) 피부병이 있어서 하루에 두 번 연고를 발라줘야해요"
                          />
                          <LabelTextField
                            name="relatedLink"
                            control={control}
                            label="관련 링크"
                            placeholder="URL"
                            maxLength={500}
                          />
                        </YStack>
                      </Accordion.HeightAnimator>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion>
              </YStack>
            </Accordion.HeightAnimator>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <Divider />

      <Accordion type="single" collapsible>
        <Accordion.Item value="behavior">
          <Accordion.Header unstyled>
            <AccordionSectionTrigger unstyled>
              {({ open }: { open: boolean }) => (
                <>
                  <SectionTitle mb={0}>성격·생활 습관 (선택)</SectionTitle>
                  <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                    <DownArrow width={16} height={16} color={black500.val} />
                  </Square>
                </>
              )}
            </AccordionSectionTrigger>
          </Accordion.Header>
          <Accordion.Content bg="transparent" p={0}>
            <Accordion.HeightAnimator animation="quick" exitStyle={{ opacity: 0, height: 0 }}>
              <YStack px={20} pb={24} gap={16}>
                <LabelChipGroup
                  name="toiletTraining"
                  control={control}
                  label="배변훈련"
                  clearable
                  stretch
                  options={CREATE_POST_OPTIONS.toiletTraining}
                />
                <LabelChipGroup
                  name="separationAnxiety"
                  control={control}
                  label="혼자 있기"
                  clearable
                  stretch
                  options={CREATE_POST_OPTIONS.separationAnxiety}
                />
                <LabelChipGroup
                  name="barking"
                  control={control}
                  label="짖음"
                  clearable
                  stretch
                  options={CREATE_POST_OPTIONS.barking}
                />
                <LabelChipGroup
                  name="activityLevel"
                  control={control}
                  label="활동량"
                  clearable
                  options={CREATE_POST_OPTIONS.activityLevel}
                />

                <Accordion type="single" collapsible>
                  <Accordion.Item value="social-section">
                    <Accordion.Header unstyled>
                      <AccordionTrigger unstyled>
                        {({ open }: { open: boolean }) => (
                          <>
                            <Paragraph fontSize={14} lineHeight={20} fontWeight="500" flex={1} color="$black600">
                              사회성 (선택)
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
                          <LabelChipGroup
                            name="withChildren"
                            control={control}
                            label="아이와"
                            clearable
                            stretch
                            options={CREATE_POST_OPTIONS.socialCompatibility}
                          />
                          <LabelChipGroup
                            name="withDogs"
                            control={control}
                            label="강아지와"
                            clearable
                            stretch
                            options={CREATE_POST_OPTIONS.socialCompatibility}
                          />
                          <LabelChipGroup
                            name="withCats"
                            control={control}
                            label="고양이와"
                            clearable
                            stretch
                            options={CREATE_POST_OPTIONS.socialCompatibility}
                          />
                        </YStack>
                      </Accordion.HeightAnimator>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion>
              </YStack>
            </Accordion.HeightAnimator>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <Divider />

      <Accordion type="single" collapsible onLayout={onContactLayout}>
        <Accordion.Item value="contact">
          <Accordion.Header unstyled>
            <AccordionSectionTrigger unstyled>
              {({ open }: { open: boolean }) => (
                <>
                  <SectionTitle mb={0}>연락처 (선택)</SectionTitle>
                  <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                    <DownArrow width={16} height={16} color={black500.val} />
                  </Square>
                </>
              )}
            </AccordionSectionTrigger>
          </Accordion.Header>
          <Accordion.Content bg="transparent" p={0}>
            <Accordion.HeightAnimator animation="quick" exitStyle={{ opacity: 0, height: 0 }}>
              <YStack px={20} pb={24}>
                <ContactHint>여러 개 선택할 수 있어요</ContactHint>
                <ContactSelectField control={control} label="연락 정보" inputRef={fieldRefs?.contactInput} />
              </YStack>
            </Accordion.HeightAnimator>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
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
  height: 48,
  rounded: 4,
  borderWidth: 1,
  borderColor: '$white800',
  flexDirection: 'row',
  items: 'center',
  justify: 'space-between',
  bg: '$white850'
});

const AccordionSectionTrigger = styled(Accordion.Trigger, {
  px: 20,
  py: 24,
  flexDirection: 'row',
  items: 'center',
  justify: 'space-between',
  bg: 'transparent'
});
