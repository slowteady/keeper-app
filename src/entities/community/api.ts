import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

import {
  CommunityAdoptDetailDto,
  CommunityAdoptDetailSchema,
  CommunityAdoptFormDto,
  CommunityListResponseDto,
  CommunityListResponseSchema,
  CommunityQnaDetailDto,
  CommunityQnaDetailSchema,
  CommunityQnaFormDto,
  CommunityQnaListResponseDto,
  CommunityQnaListResponseSchema,
  MyHelpfulCommentListResponseDto,
  MyHelpfulCommentListResponseSchema,
  QnaTypeDto
} from './schema';

export type CommunityListParams = {
  page?: number;
  size?: number;
  category?: 'ADOPTION_PERSONAL' | 'ADOPTION_LIFE' | 'QNA';
  animalType?: 'DOG' | 'CAT' | 'OTHER';
  sort?: 'NEW' | 'LIKE' | 'COMMENT' | 'VIEW';
};

const COMMUNITY_BASE = '/community/posts';

const getList = async (params: CommunityListParams): Promise<CommunityListResponseDto> => {
  // authApi 사용 — 토큰 첨부 시 server 가 isLiked 정확히 반환. publicApi 면 invalidate refetch 후 isLiked=false 로 cache 덮어쓰기 → 하트 리셋 버그.
  const res = await authApi.get<ApiResponse<CommunityListResponseDto>>(COMMUNITY_BASE, { params });
  return CommunityListResponseSchema.parse(res.data.data);
};

const getDetail = async (id: number): Promise<CommunityAdoptDetailDto> => {
  const res = await authApi.get<ApiResponse<CommunityAdoptDetailDto>>(`${COMMUNITY_BASE}/${id}`);
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

const createAdoptionPersonal = async (body: CommunityAdoptFormDto): Promise<{ id: number }> => {
  const res = await authApi.post<ApiResponse<CommunityAdoptDetailDto>>(`${COMMUNITY_BASE}/adoption-personal`, body);
  return { id: res.data.data.id };
};

const updateAdoptionPersonal = async (id: number, body: CommunityAdoptFormDto): Promise<CommunityAdoptDetailDto> => {
  const res = await authApi.patch<ApiResponse<CommunityAdoptDetailDto>>(
    `${COMMUNITY_BASE}/adoption-personal/${id}`,
    body
  );
  return CommunityAdoptDetailSchema.parse(res.data.data);
};

const deletePost = async (id: number): Promise<void> => {
  await authApi.delete<AxiosResponse>(`${COMMUNITY_BASE}/${id}`);
};

const likePost = async (id: number): Promise<{ count: number; isLiked: boolean }> => {
  const res = await authApi.post<ApiResponse<{ count: number; isLiked: boolean }>>(`${COMMUNITY_BASE}/${id}/like`);
  return res.data.data;
};

const unlikePost = async (id: number): Promise<{ count: number; isLiked: boolean }> => {
  const res = await authApi.delete<ApiResponse<{ count: number; isLiked: boolean }>>(`${COMMUNITY_BASE}/${id}/like`);
  return res.data.data;
};

const reportPost = async (id: number, body: { reason: string; reasonDetail?: string }): Promise<void> => {
  await authApi.post<AxiosResponse>(`${COMMUNITY_BASE}/${id}/report`, body);
};

const getMyLikedPosts = async (params: { page: number; size: number }): Promise<CommunityListResponseDto> => {
  const res = await authApi.get<ApiResponse<CommunityListResponseDto>>('/me/liked-posts', { params });
  return CommunityListResponseSchema.parse(res.data.data);
};

// ─── QnA ───────────────────────────────────────────────
export type QnaListParams = {
  page?: number;
  size?: number;
  type?: QnaTypeDto;
  animalType?: 'DOG' | 'CAT' | 'OTHER';
};

const getQnaList = async (params: QnaListParams): Promise<CommunityQnaListResponseDto> => {
  // 백엔드 list endpoint 공유 — category=QNA 강제 + type/animalType 필터
  const res = await authApi.get<ApiResponse<CommunityQnaListResponseDto>>(COMMUNITY_BASE, {
    params: { ...params, category: 'QNA' }
  });
  return CommunityQnaListResponseSchema.parse(res.data.data);
};

const getQnaDetail = async (id: number): Promise<CommunityQnaDetailDto> => {
  const res = await authApi.get<ApiResponse<CommunityQnaDetailDto>>(`${COMMUNITY_BASE}/${id}`);
  return CommunityQnaDetailSchema.parse(res.data.data);
};

const createQnaPost = async (body: CommunityQnaFormDto): Promise<{ id: number }> => {
  const res = await authApi.post<ApiResponse<{ id: number }>>(`${COMMUNITY_BASE}/qna`, body);
  return { id: res.data.data.id };
};

const updateQnaPost = async (id: number, body: CommunityQnaFormDto): Promise<CommunityQnaDetailDto> => {
  const res = await authApi.patch<ApiResponse<CommunityQnaDetailDto>>(`${COMMUNITY_BASE}/qna/${id}`, body);
  return CommunityQnaDetailSchema.parse(res.data.data);
};

const getMyHelpfulComments = async (params: {
  page: number;
  size: number;
}): Promise<MyHelpfulCommentListResponseDto> => {
  const res = await authApi.get<ApiResponse<MyHelpfulCommentListResponseDto>>('/me/helpful-comments', { params });
  return MyHelpfulCommentListResponseSchema.parse(res.data.data);
};

export const communityApi = {
  getList,
  getDetail,
  createAdoptionPersonal,
  updateAdoptionPersonal,
  getQnaList,
  getQnaDetail,
  createQnaPost,
  updateQnaPost,
  deletePost,
  likePost,
  unlikePost,
  reportPost
};

// 페이지네이션 제외한 list 필터 (queryKey 안정성 + page 분리)
type CommunityListFilter = Omit<CommunityListParams, 'page'>;

export const communityQueries = {
  all: () => ['community'] as const,

  list: (params: CommunityListFilter) =>
    infiniteQueryOptions({
      queryKey: [...communityQueries.all(), 'list', params] as const,
      queryFn: ({ pageParam }) => getList({ ...params, page: pageParam, size: params.size ?? 20 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      // 페이지 합치고 메타(total/page/size/hasNext) 는 마지막 페이지 기준으로 노출
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...communityQueries.all(), 'detail', id] as const,
      queryFn: () => getDetail(id),
      enabled: !!id
    }),

  // QnA list — type/animalType chip 필터 + infinite scroll
  qnaList: (params: Omit<QnaListParams, 'page'>) =>
    infiniteQueryOptions({
      queryKey: [...communityQueries.all(), 'qna', 'list', params] as const,
      queryFn: ({ pageParam }) => getQnaList({ ...params, page: pageParam, size: params.size ?? 20 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    }),

  qnaDetail: (id: number) =>
    queryOptions({
      queryKey: [...communityQueries.all(), 'qna', 'detail', id] as const,
      queryFn: () => getQnaDetail(id),
      enabled: !!id
    }),

  myLikedList: (size: number = 20) =>
    infiniteQueryOptions({
      queryKey: ['me-liked-posts', { size }] as const,
      queryFn: ({ pageParam }) => getMyLikedPosts({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    }),

  myHelpfulCommentList: (size: number = 20) =>
    infiniteQueryOptions({
      // 도메인 prefix(`['comment']`) 와 별도 namespace — useCommentHelpful 의 invalidate 휩쓸기 차단 (29cm 잔존 패턴).
      // optimistic patch 는 useCommentHelpful 의 setQueriesData 가 이 prefix 도 명시적으로 호출.
      queryKey: ['me-helpful-comments', { size }] as const,
      queryFn: ({ pageParam }) => getMyHelpfulComments({ page: pageParam, size }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
      select: (data) => ({
        items: data.pages.flatMap((p) => p.items),
        total: data.pages[data.pages.length - 1].total,
        page: data.pages[data.pages.length - 1].page,
        size: data.pages[data.pages.length - 1].size,
        hasNext: data.pages[data.pages.length - 1].hasNext
      })
    })
};
