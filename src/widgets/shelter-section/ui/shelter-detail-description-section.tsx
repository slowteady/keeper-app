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
        // 담당자(person)는 공공데이터상 없는 보호소가 많아 빈 경우 행 자체를 노출하지 않음
        ...(hasValue(person) ? [{ label: '담당', value: person }] : [])
      ]}
    />
  );
};
