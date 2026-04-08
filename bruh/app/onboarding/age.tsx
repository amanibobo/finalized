import { BasicsHeader } from '@/components/onboarding/BasicsHeader';
import { ContinueButton } from '@/components/onboarding/ContinueButton';
import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { mono, onboarding } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function OnboardingAgeScreen() {
  const router = useRouter();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const [age, setAge] = useState('19');

  return (
    <OnboardingScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.flex}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
            <BasicsHeader title="What is your age?" />
          </Animated.View>
          <Animated.View entering={FadeIn.duration(200).delay(80)} style={styles.center}>
            <View style={styles.inputWrap}>
              <View style={styles.inputShell}>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholderTextColor={onboarding.unitGray}
                />
                <Text style={styles.unit}>years old</Text>
              </View>
            </View>
            <View style={styles.gapBeforeContinue} />
            <ContinueButton
              onPress={() => {
                setAnswer('age', parseInt(age, 10));
                router.push('/onboarding/sex');
              }}
              disabled={!age.trim().length}
            />
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
  headerWrap: {
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingTop: 40,
  },
  inputWrap: {
    alignItems: 'center',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radii.control,
    paddingLeft: 22,
    paddingRight: 20,
    paddingVertical: 16,
    width: '50%',
  },
  gapBeforeContinue: {
    height: 36,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '400',
    color: colors.black,
    minWidth: 40,
    textAlign: 'center',
  },
  unit: {
    fontFamily: mono,
    fontSize: 15,
    color: onboarding.unitGray,
  },
});
