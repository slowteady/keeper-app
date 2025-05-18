import { useQueryClient } from '@tanstack/react-query';
import { Logo } from 'components/atoms/icons/outline';
import ScrollFloatingButton from 'components/molecules/button/ScrollFloatingButton';
import MainAbandonmentSection from 'components/sections/main/MainAbandonmentSection';
import MainBannerSection from 'components/sections/main/MainBannerSection';
import MainShelterSection from 'components/sections/main/MainShelterSection';
import { ABANDONMENTS_QUERY_KEY, SHELTER_QUERY_KEY } from 'constants/queryKeys';
import theme from 'constants/theme';
import useRefreshing from 'hooks/useRefreshing';
import useScrollFloatingButton from 'hooks/useScrollFloatingButton';
import { useCallback, useMemo } from 'react';
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

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
    const email = process.env.EXPO_PUBLIC_DEVELOPER_EMAIL;
    Linking.openURL(`mailto:${email}`);
  }, []);

  return (
    <View style={styles.footerContainer}>
      <Logo width={96} height={30} color={theme.colors.black[900]} />
      <View style={styles.menuContainer}>
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
