import { BasicsHeader } from '@/components/onboarding/BasicsHeader';
import { ContinueButton } from '@/components/onboarding/ContinueButton';
import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { colors, radii } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function OnboardingFirstNameScreen() {
  const router = useRouter();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const [name, setName] = useState('');

  return (
    <OnboardingScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.flex}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
            <BasicsHeader title="What is your first name?" />
          </Animated.View>
          <Animated.View entering={FadeIn.duration(200).delay(80)} style={styles.center}>
            <View style={styles.centerBlock}>
              <View style={styles.inputShell}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  placeholder="First name"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                />
              </View>
              <View style={styles.gapBeforeContinue} />
              <ContinueButton
                onPress={() => {
                  setAnswer('first_name', name.trim());
                  router.push('/onboarding/science-intro');
                }}
                disabled={!name.trim().length}
              />
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minHeight: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 0,
  },
  centerBlock: {
    width: '100%',
  },
  gapBeforeContinue: {
    height: 20,
  },
  inputShell: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radii.control,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  input: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.black,
    textAlign: 'center',
  },
  headerWrap: {
    paddingTop: 48,
  },
});
