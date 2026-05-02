import { applicationId } from 'expo-application';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { useCallback } from 'react';
import { Linking, Platform } from 'react-native';

import { logger } from '@/shared/lib';

export const usePermission = () => {
  const goSettingMenu = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else if (Platform.OS === 'android') {
        await startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
          data: `package:${applicationId}`
        });
      }
    } catch (err) {
      logger.error(err);
    }
  }, []);

  return { goSettingMenu };
};
