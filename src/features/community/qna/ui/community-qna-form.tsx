import { UseFormReturn } from 'react-hook-form';
import { Form, styled, Text, YStack } from 'tamagui';

import { CommunityQnaFormDto, QNA_ANIMAL_TYPE_OPTIONS, QNA_CATEGORY_OPTIONS } from '@/entities/community';
import { LabelChipGroup, LabelImageSelector, LabelTextArea, LabelTextField } from '@/features/community';

export type CommunityQnaFormProps = {
  form: UseFormReturn<CommunityQnaFormDto>;
  readOnlyImages?: boolean;
};

export const CommunityQnaForm = ({ form, readOnlyImages = false }: CommunityQnaFormProps) => {
  const { control } = form;

  return (
    <Form>
      <Caption>*은 필수 표기 정보입니다</Caption>

      <Section>
        <YStack gap={16}>
          <LabelImageSelector
            name="images"
            control={control}
            label="이미지 첨부(선택, 최대 10장)"
            max={10}
            readOnly={readOnlyImages}
          />
          <LabelChipGroup name="type" control={control} label="카테고리" required options={QNA_CATEGORY_OPTIONS} />
          <LabelChipGroup
            name="animalType"
            control={control}
            label="동물 종류"
            required
            options={QNA_ANIMAL_TYPE_OPTIONS}
          />
          <LabelTextField
            name="title"
            control={control}
            label="제목"
            required
            placeholder="예) 입양 절차가 어떻게 되나요?"
            maxLength={50}
          />
          <LabelTextArea
            name="content"
            control={control}
            label="본문"
            required
            placeholder="예) 처음 강아지를 입양하려는데 무엇부터 준비해야 할지 궁금해요"
            maxLength={1000}
            rows={6}
            minH={130}
          />
        </YStack>
      </Section>
    </Form>
  );
};

const Section = styled(YStack, {
  px: 20,
  py: 24
});

const Caption = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
  color: '$black500',
  px: 20,
  mb: 8
});
