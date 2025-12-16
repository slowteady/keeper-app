import { applicationId } from 'expo-application';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';
import { useCallback } from 'react';
import { Linking, Platform } from 'react-native';

export const usePermission = () => {
  const goSettingMenu = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      startActivityAsync(ActivityAction.APPLICATION_DETAILS_SETTINGS, {
        data: `package:${applicationId}`
      });
    }
  }, []);

  return { actions: { goSettingMenu } };
};
