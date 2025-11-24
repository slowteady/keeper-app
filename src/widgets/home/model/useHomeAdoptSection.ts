import { ADOPT_LIST_FILTER, useGetAdoptNoticesQuery } from '@/entities';
import { mapToAdopt } from '@/features';
import { ADOPT_ANIMAL_FILTER, parseQueryParam } from '@/shared';
import { FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';

export type AdoptItem = ReturnType<typeof mapToAdopt>[number];

export const useHomeAdoptSection = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string; type?: string }>();
  const listRef = useRef<FlashListRef<AdoptItem>>(null);

  const selectedFilter = useMemo(
    () => parseQueryParam(ADOPT_LIST_FILTER, ADOPT_LIST_FILTER[0].id, params.filter),
    [params.filter]
  );

  const selectedType = useMemo(
    () => parseQueryParam(ADOPT_ANIMAL_FILTER, ADOPT_ANIMAL_FILTER[0].id, params.type),
    [params.type]
  );

  const { data = [], isLoading } = useGetAdoptNoticesQuery({
    filter: selectedFilter,
    animalType: selectedType,
    size: 20
  });

  useEffect(() => {
    if (listRef.current) listRef.current.scrollToOffset({ animated: false, offset: 0 });
  }, [selectedFilter, selectedType]);

  const changeFilter = (id: string) => router.setParams({ filter: id });
  const changeType = (id: string) => router.setParams({ type: id });
  const goDetail = (id: string) => router.push({ pathname: '/adopt/[id]', params: { id } });
  const goList = () => router.push('/adopt');

  return {
    state: { selectedFilter, selectedType },
    refs: { listRef },
    data: { list: data },
    flags: { isLoading },
    actions: { changeFilter, changeType, goDetail, goList }
  };
};
