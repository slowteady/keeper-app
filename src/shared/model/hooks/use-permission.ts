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
        const data = `package:${applicationId}`;
        try {
          // Android 12+(API 31): 위치 권한 페이지로 직접 이동
          await startActivityAsync('android.settings.APP_LOCATION_SETTINGS', { data });
        } catch {
          // Android 11 이하 폴백: 앱 권한 전체 페이지
          await startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, { data });
        }
      }
    } catch (err) {
      logger.error(err);
    }
  }, []);

  return { goSettingMenu };
};
