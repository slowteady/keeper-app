import { queryOptions } from '@tanstack/react-query';

import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import {
  InquiryDetailDto,
  InquiryDetailSchema,
  InquiryFormDto,
  InquiryListResponseDto,
  InquiryListResponseSchema
} from './schema';

const INQUIRY_BASE = '/inquiries';

const createInquiry = async (body: InquiryFormDto): Promise<InquiryDetailDto> => {
  const res = await authApi.post<ApiResponse<InquiryDetailDto>>(INQUIRY_BASE, body);
  return InquiryDetailSchema.parse(res.data.data);
};

const getMyInquiries = async (params: { page: number; size: number }): Promise<InquiryListResponseDto> => {
  const res = await authApi.get<ApiResponse<InquiryListResponseDto>>(`${INQUIRY_BASE}/my`, { params });
  return InquiryListResponseSchema.parse(res.data.data);
};

const getInquiryDetail = async (id: string): Promise<InquiryDetailDto> => {
  const res = await authApi.get<ApiResponse<InquiryDetailDto>>(`${INQUIRY_BASE}/${id}`);
  return InquiryDetailSchema.parse(res.data.data);
};

export const inquiryApi = { createInquiry, getMyInquiries, getInquiryDetail };

export const inquiryQueries = {
  all: () => ['inquiries'] as const,

  myList: (size = 50) =>
    queryOptions({
      queryKey: [...inquiryQueries.all(), 'my', { size }] as const,
      queryFn: () => getMyInquiries({ page: 1, size }),
      staleTime: 0
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...inquiryQueries.all(), 'detail', id] as const,
      queryFn: () => getInquiryDetail(id),
      enabled: !!id,
      staleTime: 0
    })
};
