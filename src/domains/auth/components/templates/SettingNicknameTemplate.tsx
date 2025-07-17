import { SignupForm } from '@/app/login/signup';
import { Button } from '@/shared/components/atoms/Button';
import { theme } from '@/shared/constants/theme.constants';
import { useFormContext } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingNicknameTemplateProps {
  onSubmit: (values: SignupForm) => void;
}

const SettingNicknameTemplate = ({ onSubmit }: SettingNicknameTemplateProps) => {
  const { setValue, handleSubmit } = useFormContext<SignupForm>();

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.container}> */}
      <View style={styles.subContainer}>
        <Text style={styles.titleText}>{'어떤 닉네임으로\n불러드릴까요?'}</Text>
      </View>
      {/* </View> */}

      <Button style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>등록하기</Text>
      </Button>
    </SafeAreaView>
  );
};

export default SettingNicknameTemplate;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.default },
  subContainer: { paddingTop: 48, flex: 1 },
  titleText: { fontSize: 26, lineHeight: 32, fontWeight: 600 },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 10
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 17,
    color: theme.colors.black[900]
  }
});
