export type AbandonmentsFilter = 'NEW' | 'NEAR_DEADLINE';
export type AbandonmentsChipId = 'NEAR_DEADLINE' | 'NEW' | 'GENDER' | 'RESULT' | 'AGE' | 'WEIGHT' | 'COLOR' | 'NEUTER';
export interface AbandonmentsFilterValue {
  value: AbandonmentsFilter;
  name: '마감임박공고' | '신규공고';
}
