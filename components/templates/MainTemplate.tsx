import { ABANDONMENTS_QUERY_KEY, SHELTER_QUERY_KEY } from '@/constants/queryKeys';
import theme from '@/constants/theme';
import useRefreshing from '@/hooks/useRefreshing';
import useScrollFloatingButton from '@/hooks/useScrollFloatingButton';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import ScrollFloatingButton from '../atoms/button/ScrollFloatingButton';
import { LogoIcon } from '../atoms/icons/LogoIcon';
import MainAbandonmentSection from '../sections/main/MainAbandonmentSection';
import MainBannerSection from '../sections/main/MainBannerSection';
import MainShelterSection from '../sections/main/MainShelterSection';

const MainTemplate = () => {
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();
  const queryClient = useQueryClient();

  const onRefreshCallback = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [ABANDONMENTS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] })
    ]);
  };

  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

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
        bounces
        decelerationRate="fast"
        initialNumToRender={2}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
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
  const handleClickContact = useCallback(() => {
    const email = 'ymlee.dev@gmail.com';
    Linking.openURL(`mailto:${email}`);
  }, []);

  return (
    <View style={styles.footerContainer}>
      <LogoIcon color={theme.colors.black[900]} />
      <View style={styles.menuContainer}>
        <Pressable>
          <Text style={styles.footerMenu}>about us</Text>
        </Pressable>
        <Pressable onPress={handleClickContact}>
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
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  footerMenu: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
    color: theme.colors.black[900]
  },
  copyright: {
    color: theme.colors.black[500],
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '300'
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
    marginBottom: 40
  }
});
