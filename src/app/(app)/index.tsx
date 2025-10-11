import { MainTemplate } from '@/domains/animal/components/templates/MainTemplate';
import { theme } from '@/shared/constants/theme.constants';
import { createStore, Provider } from 'jotai';
import { BasicModal } from '@/shared/components/organisms/BasicModal';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * 메인화면
 */
const Page = () => {
  const store = createStore();

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <MainTemplate />
        <DataCenterNoticeModal />
      </View>
    </Provider>
  );
};

export default Page;

const MODAL_DISMISS_KEY = 'DATA_CENTER_FIRE_MODAL_DISMISSED';

/**
 * 국가 데이터 센터 화재 공지 모달
 */
export const DataCenterNoticeModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkModalStatus();
  }, []);

  const checkModalStatus = async () => {
    try {
      const dismissed = await SecureStore.getItemAsync(MODAL_DISMISS_KEY);
      if (dismissed !== 'true') {
        setShowModal(true);
      }
    } catch (error) {
      console.error('모달 상태 확인 오류:', error);
      setShowModal(true);
    }
  };

  const handleDontShowAgain = async () => {
    try {
      await SecureStore.setItemAsync(MODAL_DISMISS_KEY, 'true');
      setShowModal(false);
    } catch (error) {
      console.error('모달 상태 저장 오류:', error);
      setShowModal(false);
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
  };

  const handlePressLink = async () => {
    try {
      const url = 'https://www.animal.go.kr/front/awtis/protection/protectionList.do';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('링크 열기 오류:', error);
    }
  };

  return (
    <BasicModal open={showModal}>
      <View style={styles.modalContent}>
        <BasicModal.Title value="유기동물 정보 조회 일시적 중단" style={styles.title} />
        <BasicModal.Description
          value={
            '국가정보자원관리원 화재로 인해 공공데이터포털 서비스가 정상적으로 작동하지 않고 있습니다.\n임시로 아래 국가동물보호정보시스템에서 보호 중인 동물 정보를 확인해주세요.\n\n정부 시스템이 복구되는 즉시 다시 원활히 조회하실 수 있도록 하겠습니다.\n\n키퍼 드림'
          }
          style={styles.description}
        />
        <Pressable onPress={handlePressLink} style={styles.linkContainer}>
          <Text style={styles.linkText}>국가동물보호정보시스템 바로가기</Text>
        </Pressable>
        <BasicModal.Buttons
          onClose={handleDontShowAgain}
          onPress={handleConfirm}
          SecondaryTextProps={{ children: '다시 보지 않기' }}
          PrimaryTextProps={{ children: '확인' }}
        />
      </View>
    </BasicModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  modalContent: {
    paddingTop: 32,
    paddingBottom: 16
  },
  title: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  description: {
    letterSpacing: -0.25,
    fontSize: 14,
    lineHeight: 22,
    color: '#7E7E7E',
    fontWeight: '400',
    marginBottom: 32
  },
  linkContainer: {
    alignItems: 'flex-start',
    marginBottom: 32
  },
  linkText: {
    color: theme.colors.black[500],
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
