export type AnimalType = 'DOG' | 'CAT' | 'OTHER' | 'ALL';
export interface ApiResponse<T> {
  code: string;
  data: T;
}
