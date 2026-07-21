import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

import {
  MissingContactDto,
  MissingContactsDto,
  MissingContactsSchema,
  MissingCreateFormDto,
  MissingDataDto,
  MissingDetailDto,
  MissingDetailSchema,
  MissingFeedListDto,
  MissingFeedListSchema,
  MissingListDto,
  MissingParamsDto,
  MissingResponseDto,
  MissingStatusDto
} from './schema';

const BASE_URL = '/lost';
const MISSING_URL = '/missing';

export type MissingCreateBody = Pick<
  MissingCreateFormDto,
  'animalType' | 'colorFeature' | 'lostAt' | 'lat' | 'lng' | 'address' | 'name' | 'age' | 'weight' | 'hasIdTag' | 'rfid'
> & {
  regionCode?: string | null;
  breed: string;
  gender?: string;
  images: string[];
  videoUrl?: string;
  videoThumbnailUrl?: string;
  videoDuration?: number;
  contacts: { type: string; value: string }[];
};

export type MissingFeedFilter = {
  animalType?: 'DOG' | 'CAT' | 'OTHER';
  sido?: string;
  sigungu?: string;
  status?: MissingStatusDto;
};

const getMissingFeed = async (
  params: { page: number; size: number } & MissingFeedFilter
): Promise<MissingFeedListDto> => {
  const res = await authApi.get<ApiResponse<MissingFeedListDto>>(MISSING_URL, { params });
  return MissingFeedListSchema.parse(res.data.data);
};

const getMissingDetail = async (id: string): Promise<MissingDetailDto> => {
  const res = await authApi.get<ApiResponse<MissingDetailDto>>(`${MISSING_URL}/${id}`);
  return MissingDetailSchema.parse(res.data.data);
};

export const getMissingContacts = async (id: string): Promise<MissingContactsDto> => {
  const res = await authApi.get<ApiResponse<MissingContactsDto>>(`${MISSING_URL}/${id}/contact`);
  return MissingContactsSchema.parse(res.data.data);
};

export const missingApi = {
  create: async (body: MissingCreateBody): Promise<MissingDetailDto> => {
    const res = await authApi.post<ApiResponse<MissingDetailDto>>(MISSING_URL, body);
    return MissingDetailSchema.parse(res.data.data);
  },
  update: async (id: string, body: MissingCreateBody): Promise<MissingDetailDto> => {
    const res = await authApi.patch<ApiResponse<MissingDetailDto>>(`${MISSING_URL}/${id}`, body);
    return MissingDetailSchema.parse(res.data.data);
  },
  remove: async (id: string): Promise<void> => {
    await authApi.delete(`${MISSING_URL}/${id}`);
  },
  resolve: async (id: string): Promise<MissingDetailDto> => {
    const res = await authApi.patch<ApiResponse<MissingDetailDto>>(`${MISSING_URL}/${id}/resolve`);
    return MissingDetailSchema.parse(res.data.data);
  }
};

const getMissings = async (params: MissingParamsDto): Promise<MissingListDto> => {
  const res = await authApi.get<ApiResponse<MissingListDto>>(BASE_URL, { params });
  return res.data.data;
};

const getFeaturedMissings = async (): Promise<MissingResponseDto[]> => {
  const res = await authApi.get<ApiResponse<MissingResponseDto[]>>(`${BASE_URL}/featured`);
  return res.data.data;
};

const getMissing = async (id: string): Promise<MissingDataDto> => {
  const res = await authApi.get<ApiResponse<MissingDataDto>>(`${BASE_URL}/${id}`);
  return res.data.data;
};

export const getMissingContact = async (id: string): Promise<MissingContactDto> => {
  const res = await authApi.get<ApiResponse<MissingContactDto>>(`${BASE_URL}/${id}/contact`);
  return res.data.data;
};

export const missingQueries = {
  all: () => ['missings'] as const,

  list: (params: MissingParamsDto) =>
    infiniteQueryOptions({
      queryKey: [...missingQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getMissings({ ...params, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1];
        const allData = data.pages.flatMap((page) => page.items);
        return { ...lastPage, items: allData };
      }
    }),

  featured: () =>
    queryOptions({
      queryKey: [...missingQueries.all(), 'featured'] as const,
      queryFn: getFeaturedMissings
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...missingQueries.all(), 'detail', id] as const,
      queryFn: () => getMissing(id)
    }),

  feed: (filter: MissingFeedFilter = {}) =>
    infiniteQueryOptions({
      queryKey: [...missingQueries.all(), 'feed', filter] as const,
      queryFn: ({ pageParam }) => getMissingFeed({ page: pageParam, size: 20, ...filter }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => {
        const lastPage = data.pages[data.pages.length - 1];
        const allData = data.pages.flatMap((page) => page.items);
        return { ...lastPage, items: allData };
      }
    }),

  userDetail: (id: string) =>
    queryOptions({
      queryKey: [...missingQueries.all(), 'userDetail', id] as const,
      queryFn: () => getMissingDetail(id)
    })
};
