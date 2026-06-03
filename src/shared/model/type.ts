import { Camera, CameraChangeReason } from '@mj-studio/react-native-naver-map';
import { UseMutationOptions } from '@tanstack/react-query';

export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};

export type UseMutationCustomOptions<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>;

export type CameraParams = Camera & {
  reason?: CameraChangeReason;
};
