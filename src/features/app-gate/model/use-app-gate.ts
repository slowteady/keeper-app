import * as Application from 'expo-application';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { markSoftPromptedToday, wasSoftPromptedToday } from '../lib/soft-throttle';
import { getBootstrap } from './api';

export type GateStatus = 'loading' | 'ok' | 'soft' | 'hard' | 'maintenance';

type GateState = {
  status: GateStatus;
  storeUrl: string | null;
  latestVersion: string | null;
  maintenanceMessage: string | null;
};

const OK: GateState = {
  status: 'ok',
  storeUrl: null,
  latestVersion: null,
  maintenanceMessage: null
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
            maintenanceMessage: result.maintenanceMessage
          });
          return;
        }

        if (result.updateType === 'hard' || result.updateType === 'soft') {
          if (result.updateType === 'soft' && (await wasSoftPromptedToday())) {
            setState(OK);
            return;
          }
          setState({
            status: result.updateType,
            storeUrl: result.storeUrl,
            latestVersion: result.latestVersion,
            maintenanceMessage: null
          });
          return;
        }

        setState(OK);
      } catch {
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
