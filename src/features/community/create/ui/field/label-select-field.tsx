import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';

import { CommunityAdoptFormDto } from '@/entities/community';
import { SelectField, SelectFieldProps } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export interface LabelSelectFieldProps extends Omit<SelectFieldProps, 'value' | 'status'> {
  label: string;
  required?: boolean;
  name: keyof CommunityAdoptFormDto;
  control: Control<CommunityAdoptFormDto>;
}

// 선택 전용 필드 — Controller 의 field.value 를 SelectField 에 노출하고 fieldState.error 로 inline 메시지.
// value 변경은 외부 BS 의 onSelect 에서 form.setValue 로 처리.
export const LabelSelectField = ({ label, required, name, control, ...props }: LabelSelectFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <YStack>
          <FieldLabel title={label} required={required} />
          <SelectField
            value={typeof field.value === 'string' ? field.value : ''}
            status={fieldState.error ? 'error' : 'default'}
            {...props}
          />
          <FieldError message={fieldState.error?.message} />
        </YStack>
      )}
    />
  );
};
