import { useCallback } from 'react';
import { XStack, YStack } from 'tamagui';

import { ChipButton, ChipButtonProps } from '../button/chip-button';

type ChipGroupValue<T extends boolean> = T extends true ? string[] : string;
type ChipGroupOnChange<T extends boolean> = T extends true ? (value: string[]) => void : (value: string) => void;

export type ChipOption = {
  value: string;
  label: string;
};

export interface ChipGroupProps<T extends boolean = false> extends Omit<
  ChipButtonProps,
  'children' | 'selected' | 'onPress'
> {
  options: ChipOption[];
  value?: ChipGroupValue<T>;
  onChange?: ChipGroupOnChange<T>;
  multiple?: T;
  clearable?: boolean;
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  stretch?: boolean;
}

const DIRECTION_MAP = { horizontal: XStack, vertical: YStack } as const;

export const ChipGroup = <T extends boolean = false>({
  options,
  value,
  onChange,
  multiple = false as T,
  clearable = false,
  direction = 'horizontal',
  gap = 4,
  stretch = false,
  style: chipStyle,
  ...chipProps
}: ChipGroupProps<T>) => {
  const handleChipPress = useCallback(
    (optionValue: string) => {
      if (multiple) {
        const currentValues: string[] = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];

        (onChange as ChipGroupOnChange<true>)?.(newValues);
      } else if (value === optionValue) {
        if (clearable) (onChange as ChipGroupOnChange<false>)?.('' as string);
      } else {
        (onChange as ChipGroupOnChange<false>)?.(optionValue);
      }
    },
    [value, onChange, multiple, clearable]
  );

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) ? value.includes(optionValue) : false;
    }
    return value === optionValue;
  };

  const Container = DIRECTION_MAP[direction];

  return (
    <Container
      flexWrap={stretch ? 'nowrap' : 'wrap'}
      gap={gap}
      items={direction === 'horizontal' ? 'center' : 'flex-start'}
    >
      {options.map((option) => (
        <ChipButton
          key={option.value}
          {...chipProps}
          selected={isSelected(option.value)}
          onPress={() => handleChipPress(option.value)}
          style={stretch ? { flex: 1 } : chipStyle}
        >
          {option.label}
        </ChipButton>
      ))}
    </Container>
  );
};
