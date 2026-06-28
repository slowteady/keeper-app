import * as Application from 'expo-application';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { UrgentNoticeDto } from '@/entities/notice';
import { logger } from '@/shared/lib';

import { markSoftPromptedToday, wasSoftPromptedToday } from '../lib/soft-throttle';
import { getBootstrap } from './api';

export type GateStatus = 'loading' | 'ok' | 'soft' | 'hard' | 'maintenance';

type GateState = {
  status: GateStatus;
  storeUrl: string | null;
  latestVersion: string | null;
  maintenanceMessage: string | null;
  urgentNotice: UrgentNoticeDto | null;
};

const OK: GateState = {
  status: 'ok',
  storeUrl: null,
  latestVersion: null,
  maintenanceMessage: null,
  urgentNotice: null
};

export const useAppGate = () => {
  const [state, setState] = useState<GateState>({ ...OK, status: 'loading' });

  useEffect(() => {
    (async () => {
      try {
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        const version = Application.nativeApplicationVersion ?? '';
        const result = await getBootstrap(platform, version);

        if (result.maintenance) {
          setState({
            status: 'maintenance',
            storeUrl: result.storeUrl,
            latestVersion: result.latestVersion,
            maintenanceMessage: result.maintenanceMessage,
            urgentNotice: null
          });
          return;
        }

        if (result.updateType === 'hard' || result.updateType === 'soft') {
          if (result.updateType === 'soft' && (await wasSoftPromptedToday())) {
            setState({ ...OK, urgentNotice: result.urgentNotice ?? null });
            return;
          }
          setState({
            status: result.updateType,
            storeUrl: result.storeUrl,
            latestVersion: result.latestVersion,
            maintenanceMessage: null,
            urgentNotice: null
          });
          return;
        }

        setState({ ...OK, urgentNotice: result.urgentNotice ?? null });
      } catch (e) {
        logger.error('app gate bootstrap failed, defaulting to OK', e);
        setState(OK);
      }
    })();
  }, []);

  const dismissSoft = () => {
    markSoftPromptedToday();
    setState(OK);
  };

  return { ...state, dismissSoft };
};
