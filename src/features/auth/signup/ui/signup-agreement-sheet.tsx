import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { WebView } from 'react-native-webview';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button, useBottomSheet } from '@/shared/ui';

import { AgreementState, SignupAgreement } from './signup-agreement';

const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL;
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = WINDOW_HEIGHT * 0.55;
const SHEET_PADDING_X = 24;

type RouteKey = 'agreement' | 'terms' | 'privacy' | 'community';

const ROUTES: { key: RouteKey; title: string }[] = [
  { key: 'agreement', title: 'agreement' },
  { key: 'terms', title: '이용약관' },
  { key: 'privacy', title: '개인정보 처리방침' },
  { key: 'community', title: '커뮤니티 가이드라인' }
];

const INITIAL_AGREEMENT: AgreementState = { age14: false, terms: false, privacy: false, community: false };

export type SignupAgreementSheetProps = {
  onConfirm: (agreement: AgreementState) => void;
  onClose: () => void;
  isPending?: boolean;
};

export const SignupAgreementSheet = ({ onConfirm, onClose, isPending }: SignupAgreementSheetProps) => {
  const { bottom } = useLayout();
  const { setFooter } = useBottomSheet();
  const [index, setIndex] = useState(0);
  const [agreement, setAgreement] = useState<AgreementState>(INITIAL_AGREEMENT);
  const allAgreed = agreement.age14 && agreement.terms && agreement.privacy;

  useEffect(() => {
    if (index !== 0) {
      setFooter(undefined);
      return;
    }
    setFooter(() => (
      <AgreementFooter
        bottom={bottom}
        allAgreed={allAgreed}
        isPending={isPending}
        onClose={onClose}
        onConfirm={() => onConfirm(agreement)}
      />
    ));
    return () => setFooter(undefined);
  }, [index, agreement, allAgreed, isPending, onClose, onConfirm, bottom, setFooter]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    if (route.key === 'agreement') {
      return (
        <AgreementView
          agreement={agreement}
          onChange={setAgreement}
          onViewTerms={() => setIndex(1)}
          onViewPrivacy={() => setIndex(2)}
          onViewCommunity={() => setIndex(3)}
        />
      );
    }
    return <PolicyView slug={route.key as 'terms' | 'privacy' | 'community'} onBack={() => setIndex(0)} />;
  };

  return (
    <YStack height={SHEET_HEIGHT}>
      <TabView
        navigationState={{ index, routes: ROUTES }}
        renderScene={renderScene}
        renderTabBar={() => null}
        onIndexChange={setIndex}
        swipeEnabled={false}
        initialLayout={{ width: WINDOW_WIDTH - SHEET_PADDING_X * 2 }}
      />
    </YStack>
  );
};

type PolicySlug = 'terms' | 'privacy' | 'community';

type AgreementViewProps = {
  agreement: AgreementState;
  onChange: (next: AgreementState) => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
  onViewCommunity: () => void;
};

const AgreementView = ({ agreement, onChange, onViewTerms, onViewPrivacy, onViewCommunity }: AgreementViewProps) => (
  <YStack pt={16} testID="signup-agreement-sheet" accessible={false}>
    <Title>환영해요!{'\n'}시작 전 약관 동의가 필요해요</Title>
    <SignupAgreement
      value={agreement}
      onChange={onChange}
      onViewTerms={onViewTerms}
      onViewPrivacy={onViewPrivacy}
      onViewCommunity={onViewCommunity}
    />
  </YStack>
);

const POLICY_TITLE: Record<PolicySlug, string> = {
  terms: '이용약관',
  privacy: '개인정보 처리방침',
  community: '커뮤니티 가이드라인'
};

const PolicyView = ({ slug, onBack }: { slug: PolicySlug; onBack: () => void }) => (
  <YStack flex={1}>
    <Header>
      <Pressable onPress={onBack} hitSlop={8} testID="signup-agreement-back">
        <BackIcon>←</BackIcon>
      </Pressable>
      <HeaderTitle>{POLICY_TITLE[slug]}</HeaderTitle>
      <View width={28} />
    </Header>
    <WebView
      source={{ uri: `${SHARE_URL}/policy/${slug}` }}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      startInLoadingState
      renderLoading={() => (
        <LoadingWrap>
          <ActivityIndicator size="small" color="#8BC34A" />
        </LoadingWrap>
      )}
      scrollEnabled
      showsVerticalScrollIndicator={false}
    />
  </YStack>
);

type AgreementFooterProps = {
  bottom: number;
  allAgreed: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const AgreementFooter = ({ bottom, allAgreed, isPending, onClose, onConfirm }: AgreementFooterProps) => (
  <XStack gap={8} pb={bottom || 16} pt={8}>
    <View flex={1}>
      <Button
        size="large"
        color="tertiary"
        style={{ borderRadius: 10 }}
        onPress={onClose}
        testID="signup-agreement-cancel"
      >
        취소
      </Button>
    </View>
    <View flex={2}>
      <Button
        size="large"
        style={{ borderRadius: 10 }}
        onPress={onConfirm}
        disabled={!allAgreed || isPending}
        isLoading={isPending}
        testID="signup-agreement-confirm"
      >
        동의하고 시작하기
      </Button>
    </View>
  </XStack>
);

const Title = styled(Text, {
  mt: 8,
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});

const Header = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  py: 8,
  mb: 8
});

const BackIcon = styled(Text, {
  fontSize: 28,
  color: '$black800',
  width: 28,
  text: 'center'
});

const HeaderTitle = styled(Text, {
  fontSize: 18,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.36
});

const LoadingWrap = styled(View, {
  position: 'absolute',
  t: 0,
  l: 0,
  r: 0,
  b: 0,
  items: 'center',
  justify: 'center'
});
