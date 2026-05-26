import { Control, Controller, FieldPath } from 'react-hook-form';
import { YStack } from 'tamagui';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';
import { ChipGroup } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

type OptionFieldName = keyof typeof CREATE_POST_OPTIONS;

export type OptionSelectFieldProps = {
  label: string;
  required?: boolean;
  name: OptionFieldName;
  control: Control<CommunityAdoptFormDto>;
};

export const OptionSelectField = ({ name, control, label, required }: OptionSelectFieldProps) => {
  return (
    <Controller
      name={name as FieldPath<CommunityAdoptFormDto>}
      control={control}
      render={({ field, fieldState }) => (
        <YStack>
          <FieldLabel title={label} required={required} />
          <ChipGroup
            variant="secondary"
            options={CREATE_POST_OPTIONS[name]}
            value={(field.value as string | undefined) ?? ''}
            onChange={(v) => field.onChange(v === '' ? undefined : v)}
            clearable={!required}
          />
          <FieldError message={fieldState.error?.message} />
        </YStack>
      )}
    />
  );
};
