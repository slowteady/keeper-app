import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';

import { TextField, TextFieldProps } from '@/shared';

import { CommunityAdoptFormDto } from '../../model';
import { FieldLabel } from './FieldLabel';

export interface LabelTextFieldProps extends TextFieldProps {
  label: string;
  required?: boolean;
  name: keyof CommunityAdoptFormDto;
  control: Control<CommunityAdoptFormDto>;
}

export const LabelTextField = ({ label, required, name, value, control, ...props }: LabelTextFieldProps) => {
  const hasValue = !!value;

  return (
    <YStack>
      <FieldLabel title={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TextField variant="fill" {...field} value={value} style={{ fontWeight: hasValue ? 500 : 400 }} {...props} />
        )}
      />
    </YStack>
  );
};
