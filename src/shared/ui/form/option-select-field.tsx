import { Control, FieldPath, FieldValues } from 'react-hook-form';

import { ChipOption } from '@/shared/ui';

import { LabelChipGroup } from './label-chip-group';

export type OptionSelectFieldProps<T extends FieldValues> = {
  label: string;
  required?: boolean;
  name: FieldPath<T>;
  control: Control<T>;
  options: ChipOption[];
};

export const OptionSelectField = <T extends FieldValues>({
  name,
  control,
  label,
  required,
  options
}: OptionSelectFieldProps<T>) => (
  <LabelChipGroup
    name={name}
    control={control}
    label={label}
    required={required}
    options={options}
    clearable={!required}
  />
);
