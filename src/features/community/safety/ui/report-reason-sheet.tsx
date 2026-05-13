import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View } from 'tamagui';

import { Button } from '@/shared/ui';
import { Check } from '@/shared/ui/icons/solid';

import { REPORT_REASONS } from '../lib/constants';
import { useReportReasonState } from '../model/report-reason-state';

export const ReportReasonSheetContent = () => {
  const { reason, setReason, detail, setDetail } = useReportReasonState();
  const { black800, black500 } = useTheme();

  const isOther = reason === 'OTHER';

  return (
    <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
      <Title>신고 사유를 선택해주세요</Title>

      <View mb={16}>
        {REPORT_REASONS.map((item) => {
          const isActive = item.id === reason;
          return (
            <Pressable key={item.id} style={styles.row} onPress={() => setReason(item.id)}>
              <StyledText style={{ color: isActive ? black800.val : black500.val }}>{item.label}</StyledText>
              {isActive && <Check width={17} height={20} color={black800.val} />}
            </Pressable>
          );
        })}
      </View>

      {isOther && (
        <View mb={16}>
          {/* BP: BottomSheetTextInput — 시트 키보드 핸들러가 input focus 를 추적 */}
          <BottomSheetTextInput
            placeholder="상세 사유를 입력해주세요"
            value={detail}
            onChangeText={setDetail}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.textInput}
          />
        </View>
      )}
    </BottomSheetScrollView>
  );
};

export type ReportReasonSheetFooterButtonProps = {
  isPending?: boolean;
  onSubmit: (reason: NonNullable<ReturnType<typeof useReportReasonState>['reason']>, detail?: string) => void;
};

export const ReportReasonSheetFooterButton = ({ isPending = false, onSubmit }: ReportReasonSheetFooterButtonProps) => {
  const { reason, detail } = useReportReasonState();

  const isOther = reason === 'OTHER';
  const canSubmit = reason !== null && (!isOther || detail.trim().length > 0) && !isPending;

  const handleSubmit = () => {
    if (!canSubmit || reason === null) return;
    onSubmit(reason, isOther ? detail.trim() : undefined);
  };

  return (
    // BottomSheetModal style 의 paddingHorizontal: 24 가 이미 적용 — 여기선 좌우 padding 0
    <View pb={24} pt={12} bg="$white900">
      <Button size="large" style={{ borderRadius: 10 }} disabled={!canSubmit} onPress={handleSubmit}>
        신고하기
      </Button>
    </View>
  );
};

const Title = styled(Text, {
  fontSize: 18,
  lineHeight: 22,
  fontWeight: '600',
  color: '$black800',
  mb: 16
});

const StyledText = styled(Text, {
  fontSize: 16,
  fontWeight: '500',
  lineHeight: 19
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 96 // footer 영역만큼 여백
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14
  },
  textInput: {
    minHeight: 80,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    fontSize: 14,
    textAlignVertical: 'top'
  }
});
