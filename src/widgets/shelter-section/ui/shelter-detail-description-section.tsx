import { hasValue } from '@/shared/lib';
import { DetailSpecSection } from '@/widgets/adopt-section';

export type ShelterDetailDescriptionSectionProps = {
  time: string;
  person: string;
  tel: string;
};

const orFallback = (value?: string) => (hasValue(value) ? (value as string) : '등록되지 않았어요');

export const ShelterDetailDescriptionSection = ({ time, person, tel }: ShelterDetailDescriptionSectionProps) => {
  return (
    <DetailSpecSection
      title="운영정보"
      boxBg="#F7F7F7"
      headerGap={10}
      withDividers
      rows={[
        { label: '운영시간', value: orFallback(time) },
        { label: '연락처', value: orFallback(tel) },
        ...(hasValue(person) ? [{ label: '담당', value: person }] : [])
      ]}
    />
  );
};
