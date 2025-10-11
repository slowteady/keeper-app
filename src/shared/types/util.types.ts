import { QueryKey, UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export type UseQueryCustomOptions<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, QueryKey>,
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
