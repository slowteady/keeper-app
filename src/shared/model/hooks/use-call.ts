import { useToastController } from '@tamagui/toast';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export const useCall = () => {
  const { show } = useToastController();

  const copy = useCallback(
    async (tel: string) => {
      await Clipboard.setStringAsync(tel);
      show('전화번호를 복사했어요.', { customData: { status: 'success' } });
    },
    [show]
  );

  const call = useCallback(
    async (tel: string) => {
      const sanitizedNumber = tel.replace(/[^0-9]/g, '').trim();
      const telLink = `tel:${sanitizedNumber}`;

      try {
        if (Platform.OS === 'ios' && Platform.isPad) {
          await copy(sanitizedNumber);
          return;
        }

        await Linking.openURL(telLink);
      } catch {
        await copy(sanitizedNumber);
      }
    },
    [copy]
  );

  return { copy, call };
};
