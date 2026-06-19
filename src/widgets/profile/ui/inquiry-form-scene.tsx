import { useState } from 'react';
import { styled, Text, XStack, YStack } from 'tamagui';

import { INQUIRY_TYPE_OPTIONS, InquiryTypeDto } from '@/entities/inquiry';
import { useCreateInquiry } from '@/features/inquiry';
import { BottomButton, FormLayout, ImageSelector, SelectField, TextArea, useBottomSheetMenu } from '@/shared/ui';

const MAX_CONTENT = 500;

export const InquiryFormScene = () => {
  const [type, setType] = useState<InquiryTypeDto | null>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const { submit, isPending } = useCreateInquiry();

  const { open: openTypeSheet } = useBottomSheetMenu({
    data: INQUIRY_TYPE_OPTIONS,
    value: type,
    onPress: (d) => setType(d.id)
  });
  const typeLabel = INQUIRY_TYPE_OPTIONS.find((o) => o.id === type)?.label;

  const isValid = type !== null && content.trim().length >= 2;

  const handleSubmit = () => {
    if (!isValid || isPending) return;
    submit({ type, content: content.trim(), images });
  };

  return (
    <FormLayout
      containerProps={{ bg: '$pageBackground' }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
      footer={
        <BottomButton onPress={handleSubmit} disabled={!isValid || isPending}>
          등록하기
        </BottomButton>
      }
    >
      <Title>어떤 유형의 문의인가요?</Title>

      <YStack mt={16}>
        <SelectField value={typeLabel} placeholder="유형을 선택해주세요" onPress={openTypeSheet} />
      </YStack>

      <YStack gap={12} mt={24}>
        <XStack items="flex-end" justify="space-between">
          <SectionLabel>문의내용</SectionLabel>
          <Counter>
            {content.length}/{MAX_CONTENT}
          </Counter>
        </XStack>
        <TextArea
          value={content}
          onChangeText={setContent}
          placeholder="문의사항을 입력해주세요"
          maxLength={MAX_CONTENT}
          height={163}
          multiline
        />
      </YStack>

      <YStack gap={12} mt={32}>
        <CaptionLabel>이미지 첨부(최대10장)</CaptionLabel>
        <ImageSelector value={images} onChange={setImages} max={10} size={72} />
      </YStack>
    </FormLayout>
  );
};

const Title = styled(Text, {
  fontSize: 26,
  lineHeight: 32,
  fontWeight: '600',
  letterSpacing: -0.52,
  color: '$black900'
});

const SectionLabel = styled(Text, {
  fontSize: 17,
  lineHeight: 19,
  fontWeight: '600',
  color: '$black900'
});

const CaptionLabel = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '500',
  letterSpacing: -0.28,
  color: '$black500'
});

const Counter = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: '400',
  color: '$black500'
});
