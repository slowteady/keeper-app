import { render } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';

import { createWrapper } from '@/test/create-wrapper';

import { DateTimeField } from './date-time-field';

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn() }
}));

type Values = { lostAt: string };

const Harness = ({ value }: { value: string }) => {
  const { control } = useForm<Values>({ defaultValues: { lostAt: value } });
  return (
    <DateTimeField control={control} name="lostAt" label="실종일시" placeholder="실종일시를 선택해 주세요" required />
  );
};

describe('DateTimeField', () => {
  it('값이 없으면 플레이스홀더를 보여준다', () => {
    const { getByText } = render(<Harness value="" />, { wrapper: createWrapper() });
    expect(getByText('실종일시')).toBeTruthy();
    expect(getByText('실종일시를 선택해 주세요')).toBeTruthy();
  });

  it('값이 있으면 포맷된 일시를 보여준다', () => {
    const value = '2026-07-01T09:30:00.000Z';
    const expected = dayjs(value).format('YYYY.MM.DD HH:mm');
    const { getByText } = render(<Harness value={value} />, { wrapper: createWrapper() });
    expect(getByText(expected)).toBeTruthy();
  });
});
