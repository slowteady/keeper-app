import { Controller, UseFormReturn } from 'react-hook-form';
import { Form, styled, Text, YStack } from 'tamagui';

import { CommunityQnaFormDto, QNA_ANIMAL_TYPE_OPTIONS, QNA_CATEGORY_OPTIONS } from '@/entities/community';
import { ChipGroup, ImageSelector, TextArea, TextField } from '@/shared/ui';

export type CommunityQnaFormProps = {
  form: UseFormReturn<CommunityQnaFormDto>;
  readOnlyImages?: boolean;
};

export const CommunityQnaForm = ({ form, readOnlyImages = false }: CommunityQnaFormProps) => {
  const { control } = form;

  return (
    <Form>
      <Section>
        <FieldLabel>이미지 첨부(선택, 최대 10장)</FieldLabel>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageSelector value={field.value ?? []} onChange={field.onChange} max={10} readOnly={readOnlyImages} />
          )}
        />
      </Section>

      <Section>
        <FieldLabel>카테고리 *</FieldLabel>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <ChipGroup
              variant="secondary"
              options={QNA_CATEGORY_OPTIONS}
              value={field.value}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
      </Section>

      <Section>
        <FieldLabel>동물 종류 (선택)</FieldLabel>
        <Controller
          name="animalType"
          control={control}
          render={({ field }) => (
            <ChipGroup
              variant="secondary"
              options={QNA_ANIMAL_TYPE_OPTIONS}
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v === '' ? undefined : v)}
              clearable
            />
          )}
        />
      </Section>

      <Section>
        <FieldLabel>제목 *</FieldLabel>
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              value={field.value}
              onChangeText={field.onChange}
              placeholder="2~50자"
              maxLength={50}
              status={fieldState.error ? 'error' : 'default'}
            />
          )}
        />
      </Section>

      <Section>
        <FieldLabel>본문 *</FieldLabel>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextArea value={field.value} onChangeText={field.onChange} placeholder="2~1000자" maxLength={1000} />
          )}
        />
      </Section>
    </Form>
  );
};

const Section = styled(YStack, {
  px: 20,
  py: 16,
  gap: 8
});

const FieldLabel = styled(Text, {
  fontSize: 14,
  fontWeight: '600',
  color: '$black900'
});
