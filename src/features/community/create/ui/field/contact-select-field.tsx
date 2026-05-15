import { Control, Controller, useFormState } from 'react-hook-form';
import { YStack } from 'tamagui';

import { CommunityAdoptFormDto, CREATE_POST_OPTIONS } from '@/entities/community';
import { ChipGroup, TextField } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

export type ContactSelectFieldProps = {
  label: string;
  required?: boolean;
  control: Control<CommunityAdoptFormDto>;
};

// react-hook-form 의 errors.contact 는 두 형태로 옴
// 1) root level (chip 0개 등): { message: '최소 1개의 연락 정보를...' }
// 2) item level (특정 chip value 빈): [{ value: { message: '연락처를 입력해주세요' } }, ...]
type ContactItemError = { value?: { message?: string } };

export const ContactSelectField = ({ control, label, required }: ContactSelectFieldProps) => {
  const { errors } = useFormState({ control, name: 'contact' });
  const contactError = errors.contact;
  const rootMessage =
    contactError && 'message' in contactError ? (contactError as { message?: string }).message : undefined;
  const itemErrors = Array.isArray(contactError) ? (contactError as ContactItemError[]) : undefined;

  return (
    <Controller
      name="contact"
      control={control}
      render={({ field }) => {
        const selectedTypes = field.value.map((item) => item.type);

        const handleChipChange = (newTypes: string[]) => {
          // 최소 1개는 선택되어야 함 — chip 모두 해제 시도 시 silent fail
          if (newTypes.length === 0) return;

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
                {field.value.map((item, idx) => {
                  const itemMessage = itemErrors?.[idx]?.value?.message;
                  return (
                    <YStack key={`${item.type}-${idx}`} gap={4}>
                      <TextField
                        placeholder={getPlaceholder(item.type)}
                        variant="fill"
                        value={item.value}
                        onChangeText={(text) => handleValueChange(item.type, text)}
                        status={itemMessage ? 'error' : 'default'}
                      />
                      <FieldError message={itemMessage} />
                    </YStack>
                  );
                })}
              </YStack>
            )}
            <FieldError message={rootMessage} />
          </YStack>
        );
      }}
    />
  );
};
