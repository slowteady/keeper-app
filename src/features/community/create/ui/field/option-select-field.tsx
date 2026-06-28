import { Control, FieldPath } from 'react-hook-form';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';

import { LabelChipGroup } from './label-chip-group';

type OptionFieldName = keyof typeof CREATE_POST_OPTIONS;

export type OptionSelectFieldProps = {
  label: string;
  required?: boolean;
  name: OptionFieldName;
  control: Control<CommunityAdoptFormDto>;
};

export const OptionSelectField = ({ name, control, label, required }: OptionSelectFieldProps) => (
  <LabelChipGroup
    name={name as FieldPath<CommunityAdoptFormDto>}
    control={control}
    label={label}
    required={required}
    options={CREATE_POST_OPTIONS[name]}
    clearable={!required}
  />
);
