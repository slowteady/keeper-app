import { ANNOUNCEMENT_ANIMAL_TYPES } from '@/domains/animal/constants/announcement.constants';
import { announcementAtom } from '@/domains/animal/stores/announcement.stores';
import { AnimalType } from '@/domains/animal/types/animal.types';
import { ButtonGroup } from '@/shared/components/molecules/ButtonGroup';
import { Searchbar } from '@/shared/components/molecules/Searchbar';
import { theme } from '@/shared/constants/theme.constants';
import * as Haptics from 'expo-haptics';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { AdoptCard } from '../organisms/AdoptCard';

export const CommunityAdoptTemplate = () => {
  const [abandonmentsConfig, setAbandonmentsConfig] = useAtom(announcementAtom);

  const handleChangeType = useCallback(
    async (id: AnimalType) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAbandonmentsConfig((prev) => ({ ...prev, type: id }));
    },
    [setAbandonmentsConfig]
  );

  const handleSubmit = () => {};

  const renderItem = useCallback(({ item }: ListRenderItemInfo<any>) => {
    return (
      <View style={styles.cardContainer}>
        <AdoptCard value={item} />
      </View>
    );
  }, []);

  // const data = getAdoptListMockData(10);

  return (
    <FlatList
      data={[]}
      renderItem={renderItem}
      keyExtractor={({ id }, idx) => `${id}-${idx}`}
      bounces
      scrollEventThrottle={40}
      contentContainerStyle={styles.contentContainer}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      ListHeaderComponent={
        <>
          <View style={styles.buttonGroupWrap}>
            <ButtonGroup data={ANNOUNCEMENT_ANIMAL_TYPES} id={abandonmentsConfig.type} onChange={handleChangeType} />
          </View>
          <Searchbar onSubmit={handleSubmit} placeholder="검색해주세요." />
        </>
      }
      ListHeaderComponentStyle={styles.listHeaderContainer}
    />
  );
};

const styles = StyleSheet.create({
  listHeaderContainer: { paddingHorizontal: 20 },
  contentContainer: { paddingVertical: 32 },
  buttonGroupWrap: { marginBottom: 16, alignSelf: 'baseline', width: '100%' },
  cardContainer: { paddingVertical: 32, paddingHorizontal: 20 },
  divider: { height: 1, backgroundColor: theme.colors.white[600] }
});
