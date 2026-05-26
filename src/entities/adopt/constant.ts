import type { AdoptStatusDto } from './schema';

export const ADOPT_OPTIONS = {
  ANIMAL: [
    { id: 'ALL', label: '전체' },
    { id: 'DOG', label: '강아지' },
    { id: 'CAT', label: '고양이' },
    { id: 'OTHER', label: '기타' }
  ] as const,
  FILTER: [
    { id: 'ALL', label: '전체' },
    { id: 'NEAR_DEADLINE', label: '마감임박' },
    { id: 'NEW', label: '신규' }
  ] as const
} as const;

type AdoptStatusInfo = {
  label: string;
  tone: 'positive' | 'neutral';
  bannerText: string;
};

export const ADOPT_STATUS_INFO: Record<Exclude<AdoptStatusDto, 'PROTECTING'>, AdoptStatusInfo> = {
  ADOPTED: {
    label: '입양완료',
    tone: 'positive',
    bannerText: '이 친구는 새 가족을 만났어요'
  },
  DONATED: {
    label: '기증',
    tone: 'positive',
    bannerText: '이 친구는 다른 기관으로 보내졌어요'
  },
  RELEASED: {
    label: '방사',
    tone: 'positive',
    bannerText: '이 친구는 자연으로 돌아갔어요'
  },
  RETURNED: {
    label: '반환',
    tone: 'neutral',
    bannerText: '보호자에게 반환되어 종료된 공고예요'
  },
  NATURAL_DEATH: {
    label: '자연사',
    tone: 'neutral',
    bannerText: '이 공고는 종료되었어요'
  },
  EUTHANIZED: {
    label: '안락사',
    tone: 'neutral',
    bannerText: '이 공고는 종료되었어요'
  }
};

export type EndedStatus = Exclude<AdoptStatusDto, 'PROTECTING'>;

export const isAdoptEnded = (status?: AdoptStatusDto): status is EndedStatus =>
  status !== undefined && status !== 'PROTECTING';
