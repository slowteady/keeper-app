import { DetailSpecSection } from '@/widgets/adopt-section';

export type ShelterDetailDescriptionSectionProps = {
  time: string;
  person: string;
  tel: string;
};

const hasValue = (value?: string) => !!value && value.trim().length > 0;
const orFallback = (value?: string) => (hasValue(value) ? (value as string) : '등록되지 않았어요');

export const ShelterDetailDescriptionSection = ({ time, person, tel }: ShelterDetailDescriptionSectionProps) => {
  return (
    <DetailSpecSection
      title="운영정보"
      rows={[
        { label: '운영시간', value: orFallback(time) },
        { label: '연락처', value: orFallback(tel) },
        ...(hasValue(person) ? [{ label: '담당', value: person }] : [])
      ]}
    />
  );
};
