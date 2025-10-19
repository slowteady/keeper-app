import { Control, Controller, FieldPath } from 'react-hook-form';
import { YStack } from 'tamagui';

import { ChipGroup } from '@/shared';

import { CREATE_POST_OPTIONS, TCreatePostDto } from '../../model';
import { FieldLabel } from './FieldLabel';

type OptionFieldName = keyof typeof CREATE_POST_OPTIONS;

export interface OptionSelectFieldProps {
  label: string;
  required?: boolean;
  name: OptionFieldName;
  control: Control<TCreatePostDto>;
}

export const OptionSelectField = ({ name, control, label, required }: OptionSelectFieldProps) => {
  return (
    <Controller
      name={name as FieldPath<TCreatePostDto>}
      control={control}
      render={({ field }) => (
        <YStack>
          <FieldLabel title={label} required={required} />
          <ChipGroup
            variant="secondary"
            isPressable
            options={CREATE_POST_OPTIONS[name]}
            value={field.value as string}
            onChange={field.onChange}
          />
        </YStack>
      )}
    />
  );
};
