import { Control, Controller, FieldPath } from 'react-hook-form';
import { YStack } from 'tamagui';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';
import { ChipGroup } from '@/shared/ui';

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
