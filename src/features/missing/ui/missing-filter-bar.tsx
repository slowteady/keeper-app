import { XStack } from 'tamagui';

import { MISSING_STATUS_INFO, MissingStatusDto } from '@/entities/missing';
import { ChipButton, FilterChip, useBottomSheetMenu } from '@/shared/ui';

export type MissingStatusFilter = MissingStatusDto | 'ALL';

const STATUS_OPTIONS = [
  { id: '', label: '전체' },
  { id: 'MISSING', label: MISSING_STATUS_INFO.MISSING.label },
  { id: 'RESOLVED', label: MISSING_STATUS_INFO.RESOLVED.label }
] as const;

export type MissingFilterBarProps = {
  active: boolean;
  onPressNearby: () => void;
  status?: MissingStatusFilter;
  onChangeStatus?: (status: MissingStatusFilter) => void;
};

export const MissingFilterBar = ({ active, onPressNearby, status = 'ALL', onChangeStatus }: MissingFilterBarProps) => {
  const applied = status === 'ALL' ? '' : status;

  const { open: openStatus } = useBottomSheetMenu({
    data: STATUS_OPTIONS,
    value: applied,
    onPress: (item) => onChangeStatus?.(item.id === '' ? 'ALL' : (item.id as MissingStatusDto))
  });

  const label = STATUS_OPTIONS.find((item) => item.id === applied)?.label;

  return (
    <XStack items="center" gap={6}>
      <ChipButton selected={active} onPress={onPressNearby}>
        내 주변
      </ChipButton>
      {onChangeStatus && (
        <FilterChip label={applied ? (label ?? '상태') : '상태'} active={!!applied} onPress={openStatus} />
      )}
    </XStack>
  );
};
