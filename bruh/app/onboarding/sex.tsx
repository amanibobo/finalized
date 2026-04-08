import { BasicsHeader } from '@/components/onboarding/BasicsHeader';
import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { SelectionPill } from '@/components/onboarding/SelectionPill';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const OPTIONS = ['Female', 'Male'] as const;

export default function OnboardingSexScreen() {
  const router = useRouter();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);

  const go = (label: string) => {
    setAnswer('sex', label.toLowerCase());
    router.push('/onboarding/race');
  };

  return (
    <OnboardingScreenWrapper>
      <View style={styles.flex}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
          <BasicsHeader title={'What is your biological sex?'} />
        </Animated.View>
        <View style={styles.bottom}>
          <View style={styles.stack}>
            {OPTIONS.map((label, i) => (
              <Animated.View key={label} entering={FadeIn.duration(200).delay(80 + i * 40)}>
                <SelectionPill label={label} onPress={() => go(label)} />
              </Animated.View>
            ))}
          </View>
        </View>
      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minHeight: 0,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 36,
    minHeight: 0,
  },
  stack: {
    gap: 14,
    width: '100%',
  },
  headerWrap: {
    paddingTop: 48,
  },
});
