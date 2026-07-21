import { useMutation } from '@tanstack/react-query';

import { getMissingContacts, MissingContactItemDto } from '@/entities/missing';
import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';

export const useMissingContact = (id: string, onLoaded: (contacts: MissingContactItemDto[]) => void) => {
  const { requireLogin } = useLoginRequired();

  const { mutate, isPending } = useMutation({
    mutationFn: () => getMissingContacts(id),
    onSuccess: ({ contacts }) => {
      if (!contacts.length) {
        globalToast('등록된 연락처가 없어요', 'fail');
        return;
      }
      onLoaded(contacts);
    },
    onError: () => globalToast('연락처를 불러오지 못했어요', 'fail')
  });

  const requestContact = () => requireLogin(() => mutate());

  return { isPending, requestContact };
};
