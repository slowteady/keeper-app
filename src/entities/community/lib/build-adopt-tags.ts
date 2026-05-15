import type { AnimalTypeDto, NeuterYnDto, VaccinationCheckDto } from '@/shared/model';

import type { ProtectionTypeDto } from '../schema';

// 개인입양 게시글의 enum 선택값을 사람이 읽을 수 있는 라벨 배열로 변환.
// 백엔드는 raw enum 만 응답하고, 카드/상세 표시용 라벨은 프론트가 생성한다 (관심사 분리).
// NONE / 미상 / undefined 인 항목은 의미가 없으므로 생략한다.
export type AdoptTagInput = {
  animalType?: AnimalTypeDto;
  gender?: string;
  neuterYn?: NeuterYnDto;
  protectionType?: ProtectionTypeDto;
  vaccinationCheck?: VaccinationCheckDto | null;
};

export const buildAdoptTags = (input: AdoptTagInput): string[] => {
  const tags: string[] = [];

  switch (input.animalType) {
    case 'DOG':
      tags.push('강아지');
      break;
    case 'CAT':
      tags.push('고양이');
      break;
    case 'OTHER':
      tags.push('기타');
      break;
  }

  switch (input.gender) {
    case 'M':
      tags.push('남아');
      break;
    case 'F':
      tags.push('여아');
      break;
  }

  switch (input.neuterYn) {
    case 'Y':
      tags.push('중성화');
      break;
    case 'N':
      tags.push('비중성화');
      break;
  }

  switch (input.protectionType) {
    case 'ADOPTION':
      tags.push('입양');
      break;
    case 'TEMPORARY':
      tags.push('임시보호');
      break;
    case 'BOTH':
      tags.push('모두가능');
      break;
  }

  switch (input.vaccinationCheck) {
    case 'NOT':
      tags.push('미접종');
      break;
    case 'FIRST':
      tags.push('1차접종');
      break;
    case 'SECOND':
      tags.push('2차접종');
      break;
    case 'THIRD':
      tags.push('3차접종');
      break;
  }

  return tags;
};
