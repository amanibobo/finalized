import { BasicsHeader } from '@/components/onboarding/BasicsHeader';
import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { SelectionPill } from '@/components/onboarding/SelectionPill';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function OnboardingUsScreen() {
  const router = useRouter();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);

  const go = (inUs: boolean) => {
    setAnswer('in_us', inUs);
    router.push('/onboarding/height');
  };

  return (
    <OnboardingScreenWrapper>
      <View style={styles.flex}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
          <BasicsHeader title={'Do you live in the United States?'} />
        </Animated.View>
        <View style={styles.bottom}>
          <View style={styles.stack}>
            <Animated.View entering={FadeIn.duration(200).delay(80)}>
              <SelectionPill label={"Yes, I'm in the US"} onPress={() => go(true)} />
            </Animated.View>
            <Animated.View entering={FadeIn.duration(200).delay(120)}>
              <SelectionPill label={"No, I'm not in the US"} onPress={() => go(false)} />
            </Animated.View>
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
