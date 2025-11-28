import { Camera, CameraChangeReason, Region } from '@mj-studio/react-native-naver-map';
import {
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions
} from '@tanstack/react-query';

export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export type UseQueryCustomOptions<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
  'queryKey'
> & { queryKey?: readonly unknown[] };

export type UseSuspenseQueryCustomOptions<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> = Omit<
  UseSuspenseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
  'queryKey'
> & { queryKey?: readonly unknown[] };

export type UseMutationCustomOptions<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>;

export type UseInfiniteQueryCustomOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TPageParam = number
> = Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, QueryKey, TPageParam>, 'queryKey'>;

export type CameraParams = Camera & {
  reason?: CameraChangeReason;
  region?: Region;
};
