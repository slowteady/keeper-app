import { ChipOption } from '@/shared/ui';

import { MissingCreateFormDto, MissingStatusDto } from './schema';

export const MISSING_STATUS_INFO: Record<MissingStatusDto, { label: string; bannerText: string }> = {
  MISSING: { label: '실종중', bannerText: '아직 가족을 찾고 있어요' },
  RESOLVED: { label: '찾음', bannerText: '이 친구는 가족의 품으로 돌아갔어요' }
};

export const MISSING_FORM_OPTIONS = {
  animalType: [
    { value: 'DOG', label: '강아지' },
    { value: 'CAT', label: '고양이' },
    { value: 'OTHER', label: '기타' }
  ],
  gender: [
    { value: 'M', label: '남아' },
    { value: 'F', label: '여아' }
  ],
  hasIdTag: [
    { value: 'Y', label: '있어요' },
    { value: 'N', label: '없어요' }
  ],
  contact: [
    { value: 'PHONE', label: '전화번호' },
    { value: 'EMAIL', label: '이메일' },
    { value: 'SNS', label: 'SNS' }
  ]
} satisfies Record<string, ChipOption[]>;

export const MISSING_FORM_FIELD_ORDER: (keyof MissingCreateFormDto)[] = [
  'images',
  'animalType',
  'colorFeature',
  'lostAt',
  'address',
  'lat',
  'lng',
  'name',
  'gender',
  'specificType',
  'age',
  'weight',
  'hasIdTag',
  'rfid',
  'contact'
];
