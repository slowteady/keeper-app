import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { getKakaoRegionCode } from '@/features/address';

export type MissingRegion = { sido: string; sigungu?: string };

export type NearbyResult = { ok: true } | { ok: false; reason: 'permission' | 'resolve' };

export const useMissingFilter = () => {
  const [region, setRegion] = useState<MissingRegion | null>(null);
  const [resolving, setResolving] = useState(false);

  const applyNearby = useCallback(async (): Promise<NearbyResult> => {
    setResolving(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return { ok: false, reason: 'permission' };
      }

      const { coords } = await Location.getCurrentPositionAsync();
      const { data } = await getKakaoRegionCode(String(coords.longitude), String(coords.latitude));
      const doc = data.documents.find((d) => d.region_type === 'B') ?? data.documents[0];
      if (!doc?.region_1depth_name) {
        return { ok: false, reason: 'resolve' };
      }

      setRegion({ sido: doc.region_1depth_name, sigungu: doc.region_2depth_name || undefined });
      return { ok: true };
    } catch {
      return { ok: false, reason: 'resolve' };
    } finally {
      setResolving(false);
    }
  }, []);

  const clear = useCallback(() => setRegion(null), []);

  return { region, resolving, applyNearby, clear };
};
