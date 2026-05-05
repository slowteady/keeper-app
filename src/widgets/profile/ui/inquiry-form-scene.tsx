import { useState } from 'react';
import { styled, Text, XStack, YStack } from 'tamagui';

import { BottomButton, ButtonGroup, FormLayout, ImageSelector, TextArea } from '@/shared/ui';

const INQUIRY_TYPES = [
  { id: 'adoption', label: '입양' },
  { id: 'missing', label: '실종|목격' },
  { id: 'donation', label: '후원' },
  { id: 'bug', label: '오류' },
  { id: 'suggestion', label: '제안' },
  { id: 'etc', label: '기타' }
] as const;

type InquiryType = (typeof INQUIRY_TYPES)[number]['id'];

const MAX_CONTENT = 500;

export const InquiryFormScene = () => {
  const [type, setType] = useState<InquiryType | null>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const isValid = type !== null && content.trim().length > 0;

  const handleSubmit = () => {
    // TODO: POST /api/inquiries (백엔드 미구현)
  };

  return (
    <FormLayout
      containerProps={{ bg: '$pageBackground' }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
      footer={
        <BottomButton onPress={handleSubmit} disabled={!isValid}>
          등록하기
        </BottomButton>
      }
    >
      <Title>어떤 유형의 문의인가요?</Title>

      <YStack gap={6} mt={16}>
        <ButtonGroup data={INQUIRY_TYPES.slice(0, 3)} id={type as InquiryType} onChange={setType} />
        <ButtonGroup data={INQUIRY_TYPES.slice(3, 6)} id={type as InquiryType} onChange={setType} />
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
