import { Directory, Paths } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { logger } from '@/shared/lib';

const getImageCacheDirs = (): Directory[] => {
  if (Platform.OS === 'ios') {
    return [new Directory(Paths.cache, 'com.hackemist.SDImageCache/default')];
  }
  return [new Directory(Paths.cache, 'image_manager_disk_cache')];
};

const measureImageCacheBytes = (): number => {
  return getImageCacheDirs().reduce((acc, dir) => {
    try {
      if (!dir.exists) return acc;
      return acc + (dir.size ?? 0);
    } catch (e) {
      logger.warn('measureImageCacheBytes: dir size failed', dir.uri, e);
      return acc;
    }
  }, 0);
};

export const useCacheSize = () => {
  const [bytes, setBytes] = useState<number | null>(null);

  const refresh = useCallback(() => {
    try {
      setBytes(measureImageCacheBytes());
    } catch (e) {
      logger.warn('useCacheSize.refresh failed', e);
      setBytes(0);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bytes, refresh };
};

export const formatBytes = (bytes: number | null): string => {
  if (bytes === null) return '계산 중...';
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
};
