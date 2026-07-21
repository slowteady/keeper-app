import { RefObject } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { LayoutChangeEvent, TextInput } from 'react-native';
import { Form, styled, Text, View, YStack } from 'tamagui';

import { MISSING_FORM_OPTIONS, MissingCreateFormDto } from '@/entities/missing';
import {
  ContactSelectField,
  DateTimeField,
  LabelSelectField,
  LabelTextArea,
  LabelTextField,
  MediaAttachField,
  OptionSelectField
} from '@/shared/ui/form';

export type MissingFormProps = {
  form: UseFormReturn<MissingCreateFormDto>;
  onPressLocation: () => void;
  onPressAge: () => void;
  onPressKind: () => void;
  fieldRefs?: {
    images?: RefObject<React.ElementRef<typeof View> | null>;
    contactInput?: RefObject<TextInput | null>;
  };
  onContactLayout?: (event: LayoutChangeEvent) => void;
};

export const MissingForm = ({
  form,
  onPressLocation,
  onPressAge,
  onPressKind,
  fieldRefs,
  onContactLayout
}: MissingFormProps) => {
  const { control } = form;
  const hasIdTag = useWatch({ control, name: 'hasIdTag' });

  return (
    <Form>
      <Caption>*은 필수 표기 정보입니다</Caption>

      <Section ref={fieldRefs?.images}>
        <MediaAttachField control={control} label="사진·동영상 첨부(최대 10장)" required max={10} />
      </Section>

      <Divider />

      <Section>
        <SectionTitle>실종 정보</SectionTitle>
        <YStack gap={16}>
          <OptionSelectField
            name="animalType"
            control={control}
            label="분류"
            required
            options={MISSING_FORM_OPTIONS.animalType}
          />
          <LabelTextArea
            name="colorFeature"
            control={control}
            label="특징"
            required
            maxLength={500}
            rows={4}
            minH={100}
            placeholder="예) 크림색 소형 푸들, 왼쪽 귀에 검은 반점, 빨간 목줄 착용, 낯가림 있고 겁이 많아요"
          />
          <DateTimeField
            name="lostAt"
            control={control}
            label="실종 일시"
            required
            placeholder="실종일시를 선택해 주세요"
          />
          <LabelSelectField
            name="address"
            control={control}
            label="실종 장소"
            placeholder="실종 장소를 검색해 주세요"
            required
            onPress={onPressLocation}
          />
        </YStack>
      </Section>

      <Divider />

      <Section>
        <SectionTitle>아이 정보</SectionTitle>
        <YStack gap={16}>
          <LabelTextField
            name="name"
            control={control}
            label="이름"
            required
            maxLength={30}
            placeholder="이름을 입력해주세요"
          />
          <LabelSelectField
            name="specificType"
            control={control}
            label="품종"
            placeholder="품종을 선택해주세요"
            required
            onPress={onPressKind}
          />
          <OptionSelectField
            name="hasIdTag"
            control={control}
            label="인식칩"
            required
            options={MISSING_FORM_OPTIONS.hasIdTag}
          />
          {hasIdTag === 'Y' && (
            <LabelTextField
              name="rfid"
              control={control}
              label="동물등록번호"
              keyboardType="number-pad"
              maxLength={20}
              placeholder="예) 410123456789012 (발견자가 대조할 수 있어요)"
            />
          )}
          <OptionSelectField name="gender" control={control} label="성별" options={MISSING_FORM_OPTIONS.gender} />
          <LabelSelectField
            name="age"
            control={control}
            label="나이"
            right={<Text color="$black500">년생</Text>}
            placeholder="나이를 선택해주세요"
            onPress={onPressAge}
          />
          <LabelTextField
            name="weight"
            control={control}
            label="몸무게"
            placeholder="예) 3.5"
            keyboardType="decimal-pad"
            maxLength={5}
            right={<Text color="$black500">kg</Text>}
          />
        </YStack>
      </Section>

      <Divider />

      <Section onLayout={onContactLayout}>
        <ContactSelectField
          name="contact"
          control={control}
          options={MISSING_FORM_OPTIONS.contact}
          label="연락 정보"
          helper="여러 개 선택할 수 있어요"
          required
          inputRef={fieldRefs?.contactInput}
        />
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
  lineHeight: 26,
  fontWeight: '600',
  color: '$blackMain',
  letterSpacing: -0.25,
  mb: 16
});

const Caption = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
  color: '$black500',
  px: 20,
  mb: 8
});
