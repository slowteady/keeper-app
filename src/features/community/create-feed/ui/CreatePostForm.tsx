import { UseFormReturn } from 'react-hook-form';
import { Accordion, Form, Paragraph, Square, styled, Text, useTheme, View, YStack } from 'tamagui';

import { ContactSelectField, LabelImageSelector, LabelTextArea, LabelTextField, OptionSelectField } from '@/entities';
import { CommunityAdoptFormDto } from '@/entities/community';
import { DownArrow } from '@/shared/ui/icons/mini';

export interface CreatePostFormProps {
  form: UseFormReturn<CommunityAdoptFormDto>;
  onPressWeight: () => void;
  onPressAge: () => void;
  onPressKind: () => void;
  onPressLocation: () => void;
}

export const CreatePostForm = ({
  form,
  onPressWeight,
  onPressAge,
  onPressKind,
  onPressLocation
}: CreatePostFormProps) => {
  const { black500 } = useTheme();
  const { control } = form;

  return (
    <>
      <YStack>
        <H1 color="$black900">개인입양 홍보</H1>
        <Caption>*은 필수 표기 정보입니다.</Caption>
      </YStack>

      <Form>
        <YStack px={20} gap={16}>
          <OptionSelectField name="animalType" control={control} label="분류" required />
          <OptionSelectField name="gender" control={control} label="성별" required />
          <OptionSelectField name="neuterYn" control={control} label="중성화" required />
          <OptionSelectField name="healthCheck" control={control} label="건강검진" required />
          <OptionSelectField name="protectionType" control={control} label="보호 유형" required />
          <OptionSelectField name="vaccinationCheck" control={control} label="예방접종" required />
          <LabelTextField
            label="몸무게"
            required
            name="weight"
            control={control}
            placeholder="몸무게를 선택해주세요."
            right={<Text color="$black500">kg</Text>}
            maxLength={2}
            value={form.watch('weight')}
            onPress={onPressWeight}
            disabled
          />
          <LabelTextField
            name="location"
            control={control}
            label="지역"
            required
            placeholder="지역을 추가해주세요."
            value={form.watch('location')}
            onPress={onPressLocation}
            disabled
          />
          <LabelTextField
            name="age"
            control={control}
            label="나이"
            required
            right={<Text color="$black500">년생</Text>}
            placeholder="나이를 선택해주세요."
            value={form.watch('age')}
            onPress={onPressAge}
            disabled
          />
          <LabelTextField
            name="specificType"
            control={control}
            label="품종"
            required
            placeholder="품종을 선택해주세요."
            value={form.watch('specificType')}
            onPress={onPressKind}
            disabled
          />
          <LabelTextArea
            name="title"
            control={control}
            label="제목"
            required
            maxLength={30}
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
            placeholder="예)성격, 특별한 사연 등을 자유롭게 적어주세요."
          />
          <LabelTextArea
            name="specialMark"
            control={control}
            label="특징"
            required
            rows={2}
            minH={80}
            maxLength={100}
            placeholder="예)겁이 많아요, 치석이 있어요"
          />
          <ContactSelectField control={control} label="연락 정보 (중복가능)" required />
          <LabelImageSelector name="images" control={control} label="이미지 첨부(최대 10장)" required max={10} />

          <Divider mt={12} />
        </YStack>

        <YStack px={20} my={40}>
          <YStack mb={20}>
            <OptionalTitle>필수 정보를 모두 체크하셨나요?</OptionalTitle>
            <OptionalDescription>더 많은 관심을 위해 세부정보도 작어보세요.</OptionalDescription>
          </YStack>

          <Accordion type="single" collapsible>
            <Accordion.Item value="optional-section">
              <Accordion.Header>
                <AccordionTrigger>
                  {({ open }: { open: boolean }) => (
                    <>
                      <Paragraph fontSize={14} fontWeight="500" flex={1} color="#7E7E7E">
                        펼쳐보기
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
                      placeholder="예) 산책과 드라이브를 좋아해요."
                    />
                    <LabelTextArea
                      name="dislikes"
                      control={control}
                      label="싫어해요"
                      rows={3}
                      minH={70}
                      maxLength={100}
                      placeholder="예) 모르는 사람은 무서워해요."
                    />
                    <LabelTextArea
                      name="health"
                      control={control}
                      label="아파요"
                      rows={3}
                      minH={70}
                      maxLength={100}
                      placeholder="예) 피부병이 있어서 하루에 두 번 연고를 발라줘야해요."
                    />
                    <LabelTextField name="relatedLink" control={control} label="관련 링크" placeholder="URL" />
                  </YStack>
                </Accordion.HeightAnimator>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </YStack>

        {/* <YStack px={20} py={32}>
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
        </YStack> */}
      </Form>
    </>
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
const OptionalTitle = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 600,
  color: '$blackMain',
  mb: 8,
  letterSpacing: -0.25
});
const OptionalDescription = styled(Text, {
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '$4',
  color: '$black500',
  letterSpacing: -0.25
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
  bg: '#F7F7F7'
});
