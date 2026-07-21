import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useCallback, useRef, useState } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import { Platform } from 'react-native';
import { YStack } from 'tamagui';

import { DateTimeSelectModal, SelectField } from '@/shared/ui';

import { FieldError } from './field-error';
import { FieldLabel } from './field-label';

type DateTimeFieldProps<T extends FieldValues> = {
  label: string;
  required?: boolean;
  name: FieldPath<T>;
  control: Control<T>;
  placeholder?: string;
};

type Step = { mode: 'date' | 'time'; value: Date };

const toDate = (value: unknown): Date => {
  const parsed = typeof value === 'string' && value ? dayjs(value) : null;
  return parsed && parsed.isValid() ? parsed.toDate() : new Date();
};

const mergeDateAndTime = (date: Date, time: Date): Date =>
  dayjs(date).hour(time.getHours()).minute(time.getMinutes()).second(0).millisecond(0).toDate();

export const DateTimeField = <T extends FieldValues>({
  label,
  required,
  name,
  control,
  placeholder = '날짜와 시간을 선택해 주세요'
}: DateTimeFieldProps<T>) => {
  const { field, fieldState } = useController({ name, control });
  // 날짜 → 시간 2단계. iOS datetime 모드는 휠에 연도를 표시하지 않아
  // 지난 해 일시를 고를 때 몇 년도인지 확인할 수 없다.
  const [step, setStep] = useState<Step | null>(null);

  // 스크롤 중 리렌더가 나면 네이티브 휠이 초기화되므로 핸들러를 고정한다.
  const commitRef = useRef(field.onChange);
  commitRef.current = field.onChange;

  const handleConfirm = useCallback((picked: Date) => {
    commitRef.current(dayjs(picked).toISOString());
    setStep(null);
  }, []);

  const handleCancel = useCallback(() => setStep(null), []);

  const value = field.value;
  const display = typeof value === 'string' && value ? dayjs(value).format('YYYY.MM.DD HH:mm') : '';

  const openAndroid = () => {
    DateTimePickerAndroid.open({
      value: toDate(value),
      mode: 'date',
      maximumDate: new Date(),
      onChange: (_e, pickedDate) => {
        if (!pickedDate) return;
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          onChange: (_te, pickedTime) => {
            if (!pickedTime) return;
            commitRef.current(dayjs(mergeDateAndTime(pickedDate, pickedTime)).toISOString());
          }
        });
      }
    });
  };

  return (
    <YStack>
      <FieldLabel title={label} required={required} />
      <SelectField
        value={display}
        placeholder={placeholder}
        status={fieldState.error ? 'error' : 'default'}
        onPress={Platform.OS === 'android' ? openAndroid : () => setStep({ mode: 'date', value: toDate(value) })}
      />
      <FieldError message={fieldState.error?.message} />
      {Platform.OS === 'ios' && step && (
        <DateTimeSelectModal open title={label} value={step.value} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </YStack>
  );
};
