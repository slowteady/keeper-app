import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';
import { ChipGroup, TextField } from '@/shared/ui';

import { FieldLabel } from './field-label';

export type ContactSelectFieldProps = {
  label: string;
  required?: boolean;
  control: Control<CommunityAdoptFormDto>;
};

export const ContactSelectField = ({ control, label, required }: ContactSelectFieldProps) => {
  return (
    <Controller
      name="contact"
      control={control}
      render={({ field }) => {
        const selectedTypes = field.value.map((item) => item.type);

        const handleChipChange = (newTypes: string[]) => {
          // 최소 1개는 선택되어야 함
          if (newTypes.length === 0) {
            return;
          }

          const updatedContact = newTypes.map((type) => {
            const existingItem = field.value.find((item) => item.type === type);
            return existingItem || { type, value: '' };
          });
          field.onChange(updatedContact as CommunityAdoptFormDto['contact']);
        };

        const handleValueChange = (type: string, value: string) => {
          const updatedContact = field.value.map((item) => (item.type === type ? { ...item, value } : item));
          field.onChange(updatedContact);
        };

        const getPlaceholder = (type: string) => {
          const option = CREATE_POST_OPTIONS.contact.find((opt) => opt.value === type);
          return option?.label || '';
        };

        return (
          <YStack>
            <FieldLabel title={label} required={required} />
            <ChipGroup
              variant="secondary"
              multiple
              options={CREATE_POST_OPTIONS.contact}
              value={selectedTypes}
              onChange={handleChipChange}
            />

            {field.value.length > 0 && (
              <YStack gap={10} mt={12}>
                {field.value.map((item, idx) => (
                  <TextField
                    key={`${item.type}-${idx}`}
                    placeholder={getPlaceholder(item.type)}
                    variant="fill"
                    value={item.value}
                    onChangeText={(text) => handleValueChange(item.type, text)}
                  />
                ))}
              </YStack>
            )}
          </YStack>
        );
      }}
    />
  );
};
