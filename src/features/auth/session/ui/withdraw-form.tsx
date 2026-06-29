import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, Text, View, YStack } from 'tamagui';

import { Button, StickyFooter } from '@/shared/ui';

import { useWithdrawForm } from '../model/use-withdraw-form';

export const WithdrawForm = () => {
  const { reasons, selectedIndex, selectReason, detail, setDetail, isOther, submit, isPending } = useWithdrawForm();
  const [footerHeight, setFooterHeight] = useState(0);

  return (
    <View flex={1} bg="$pageBackground">
      <KeyboardAwareScrollView
        bottomOffset={footerHeight}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Title>{'keeper를 탈퇴하는\n이유를 알려주세요'}</Title>
        <Description>더 나은 서비스를 위해 노력할게요</Description>

        <YStack gap={12}>
          {reasons.map((item, index) => {
            const isSelected = selectedIndex === index;
            return (
              <ReasonItem key={item.code} onPress={() => selectReason(index)} isSelected={isSelected}>
                <ReasonText isSelected={isSelected}>{item.label}</ReasonText>
              </ReasonItem>
            );
          })}
        </YStack>

        {isOther && (
          <View mt={16}>
            <TextInput
              autoFocus
              placeholder="상세 사유를 입력해주세요"
              value={detail}
              onChangeText={setDetail}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.textInput}
              testID="withdraw-other-detail"
            />
          </View>
        )}
      </KeyboardAwareScrollView>

      <StickyFooter onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}>
        <Button color="destructive" onPress={submit} isLoading={isPending} disabled={isPending}>
          탈퇴하기
        </Button>
      </StickyFooter>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 40,
    paddingHorizontal: 20
  },
  textInput: {
    minHeight: 80,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    fontSize: 14,
    textAlignVertical: 'top'
  }
});

const Title = styled(Text, {
  fontSize: 26,
  lineHeight: 40,
  fontWeight: 600,
  letterSpacing: -0.25,
  color: '$black900',
  mb: 10
});

const Description = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
  letterSpacing: -0.25,
  color: '$black500',
  mb: 32
});

const ReasonItem = styled(View, {
  variants: {
    isSelected: {
      true: { bg: '$black800' },
      false: { bg: '$white850' }
    }
  } as const,
  rounded: 8,
  p: 20
});

const ReasonText = styled(Text, {
  variants: {
    isSelected: {
      true: { color: '$white900' },
      false: { color: '$black600' }
    }
  } as const,
  fontSize: 15,
  lineHeight: 17,
  letterSpacing: -0.25,
  fontWeight: 600
});
