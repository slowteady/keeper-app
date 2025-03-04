import { ABANDONMENTS_QUERY_KEY, SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import useScrollFloatingButton from '@/hooks/useScrollFloatingButton';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import ScrollFloatingButton from '../atoms/button/ScrollFloatingButton';
import { LogoIcon } from '../atoms/icons/LogoIcon';
import MainAbandonmentSection from '../sections/main/MainAbandonmentSection';
import MainBannerSection from '../sections/main/MainBannerSection';
import MainShelterSection from '../sections/main/MainShelterSection';

const MainTemplate = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const MIN_REFRESH_TIME = 1000;
    const startTime = Date.now();

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ABANDONMENTS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: SHELTER_QUERY_KEY })
    ]);

    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MIN_REFRESH_TIME) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_TIME - elapsedTime));
    }

    setRefreshing(false);
  };

  const data = useMemo(
    () => [
      { id: 'banner', Component: <MainBannerSection /> },
      { id: 'abandonments', Component: <MainAbandonmentSection /> },
      { id: 'shelters', Component: <MainShelterSection /> }
    ],
    []
  );

  return (
    <>
      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        scrollEventThrottle={40}
        nestedScrollEnabled
        bounces
        decelerationRate="fast"
        initialNumToRender={2}
        keyExtractor={(item) => item.id}
        data={data}
        renderItem={({ item }) => <>{item.Component}</>}
        ListFooterComponent={<Footer />}
        style={{ backgroundColor: theme.colors.background.default }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

export default MainTemplate;

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <LogoIcon />

      <View style={styles.menuContainer}>
        <Pressable>
          <Text style={styles.footerMenu}>about us</Text>
        </Pressable>
        <Pressable>
          <Text style={styles.footerMenu}>contact us</Text>
        </Pressable>
      </View>

      <Text style={styles.copyright}>©2025, All right reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: theme.colors.white[800],
    paddingVertical: 48,
    paddingHorizontal: 20
  },
  footerMenu: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
    color: theme.colors.black[900]
  },
  copyright: {
    color: theme.colors.black[900],
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '300'
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginVertical: 32
  }
});
