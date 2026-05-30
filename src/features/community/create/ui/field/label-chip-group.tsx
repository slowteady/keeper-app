import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { YStack } from 'tamagui';

import { ChipGroup, ChipOption } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelChipGroupProps<T extends FieldValues> {
  label: string;
  required?: boolean;
  name: FieldPath<T>;
  control: Control<T>;
  options: readonly ChipOption[];
  clearable?: boolean;
}

// 임의 폼 DTO 에 재활용 가능한 chip 선택 필드 (FieldLabel + ChipGroup + FieldError)
export const LabelChipGroup = <T extends FieldValues>({
  label,
  required,
  name,
  control,
  options,
  clearable
}: LabelChipGroupProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <YStack>
          <FieldLabel title={label} required={required} />
          <ChipGroup
            variant="secondary"
            options={[...options]}
            value={(field.value as string | undefined) ?? ''}
            onChange={(v) => field.onChange(v === '' ? undefined : v)}
            clearable={clearable}
          />
          <FieldError message={fieldState.error?.message} />
        </YStack>
      )}
    />
  );
};
