import { useCallback } from 'react';
import { Text } from 'tamagui';

import { MissingContactItemDto } from '@/entities/missing';
import { ContactSafetyNotice } from '@/features/community/safety';
import { Button, ContactSheet, useBottomSheet } from '@/shared/ui';

import { useMissingContact } from '../model/use-missing-contact';

export const ContactCta = ({ id }: { id: string }) => {
  const { present, dismiss } = useBottomSheet();

  const openSheet = useCallback(
    (contacts: MissingContactItemDto[]) => {
      present(<ContactSheet contacts={contacts} notice={<ContactSafetyNotice />} />, {
        enableDynamicSizing: true,
        onDismiss: dismiss
      });
    },
    [present, dismiss]
  );

  const { isPending, requestContact } = useMissingContact(id, openSheet);

  return (
    <Button onPress={requestContact} disabled={isPending} isLoading={isPending}>
      <Text fontSize={15} fontWeight={600} color="$black900">
        보호자에게 연락하기
      </Text>
    </Button>
  );
};
