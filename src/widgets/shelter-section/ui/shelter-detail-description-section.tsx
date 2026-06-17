import { DetailSpecSection } from '@/widgets/adopt-section';

export type ShelterDetailDescriptionSectionProps = {
  time: string;
  person: string;
  tel: string;
};

const orFallback = (value?: string) => (value && value.trim().length > 0 ? value : '등록되지 않았어요');

export const ShelterDetailDescriptionSection = ({ time, person, tel }: ShelterDetailDescriptionSectionProps) => {
  return (
    <DetailSpecSection
      title="운영정보"
      rows={[
        { label: '운영시간', value: orFallback(time) },
        { label: '연락처', value: orFallback(tel) },
        { label: '담당', value: orFallback(person) }
      ]}
    />
  );
};
