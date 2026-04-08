import { ScreenBackButton } from '@/components/ScreenBackButton';
import { AppColors } from '@/constants/colors';
import { radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Placeholder after onboarding — replace with real home flow later */
export default function NextScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  const goBack = () => {
    lightImpact();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>
        <ScreenBackButton />
        <View style={styles.content}>
          <Text style={styles.title}>You’re in</Text>
          <Text style={styles.subtitle}>This screen is a placeholder for the next step in the app.</Text>
          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={goBack}>
            <Text style={styles.btnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.cream,
  },
  inner: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.65)',
    lineHeight: 24,
    marginBottom: 28,
  },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryGreen,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radii.control,
  },
  pressed: {
    opacity: 0.9,
  },
  btnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
