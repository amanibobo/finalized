import { ScreenBackButton } from '@/components/ScreenBackButton';
import { onboarding } from '@/constants/onboarding';
import { colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
};

/**
 * Responsive horizontal padding, max content width, and a top back control.
 */
export function OnboardingScreenWrapper({ children }: Props) {
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>
        <Animated.View entering={FadeIn.duration(200)}>
          <ScreenBackButton />
        </Animated.View>
        <View style={styles.slot}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  inner: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  slot: {
    flex: 1,
    minHeight: 0,
  },
  skipDev: {
    position: 'absolute',
    bottom: 8,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipDevText: {
    fontSize: 12,
    fontWeight: '400',
    color: onboarding.unitGray,
    textDecorationLine: 'underline',
  },
});
