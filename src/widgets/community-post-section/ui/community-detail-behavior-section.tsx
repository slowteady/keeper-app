import { DetailSpecSection } from '@/widgets/adopt-section';

export type CommunityDetailBehaviorItem = {
  label: string;
  value: string;
};

export type CommunityDetailBehaviorSectionProps = {
  items: CommunityDetailBehaviorItem[];
};

export const CommunityDetailBehaviorSection = ({ items }: CommunityDetailBehaviorSectionProps) => {
  return <DetailSpecSection title="성격·생활" rows={items} />;
};
