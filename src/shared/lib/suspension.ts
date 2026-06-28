import { AxiosError } from 'axios';
import { useSyncExternalStore } from 'react';

export type SuspensionDetail = {
  reason: string | null;
  suspendedUntil: string | null;
};

type SuspensionPayload = {
  error?: string;
  details?: { reason?: string | null; suspendedUntil?: string | null };
};

const readPayload = (error: unknown): SuspensionPayload | undefined =>
  error instanceof AxiosError ? (error.response?.data as SuspensionPayload | undefined) : undefined;

export const isSuspendedError = (error: unknown): boolean =>
  error instanceof AxiosError && error.response?.status === 403 && readPayload(error)?.error === 'USER_SUSPENDED';

export const getSuspensionDetail = (error: unknown): SuspensionDetail => {
  const details = readPayload(error)?.details;
  return {
    reason: details?.reason ?? null,
    suspendedUntil: details?.suspendedUntil ?? null
  };
};

let current: SuspensionDetail | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const setSuspended = (detail: SuspensionDetail) => {
  current = detail;
  emit();
};

export const clearSuspended = () => {
  current = null;
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => current;

export const useSuspension = () => useSyncExternalStore(subscribe, getSnapshot);
