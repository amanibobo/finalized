import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenBackButton } from '@/components/ScreenBackButton';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_COL = 24;

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  const goNext = () => {
    lightImpact();
    router.push('/onboarding/age');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>
        <ScreenBackButton />
        <View style={styles.center}>
          <Text style={styles.title}>Log In</Text>
          <View style={styles.list}>
            <Pressable
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="Log In with Apple">
              <View style={styles.optionRow}>
                <View style={styles.iconCol}>
                  <FontAwesome5 name="apple" size={18} color={colors.black} brand />
                </View>
                <Text style={styles.optionText}>Log In with Apple</Text>
                <View style={[styles.iconCol, styles.iconColSpacer]} />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="Log In with Google">
              <View style={styles.optionRow}>
                <View style={styles.iconCol}>
                  <FontAwesome5 name="google" size={16} color={colors.black} brand />
                </View>
                <Text style={styles.optionText}>Log In with Google</Text>
                <View style={[styles.iconCol, styles.iconColSpacer]} />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={goNext}>
              <View style={styles.optionRow}>
                <View style={styles.iconCol}>
                  <Ionicons name="call" size={18} color={colors.black} />
                </View>
                <Text style={styles.optionText}>Log In with Phone</Text>
                <View style={[styles.iconCol, styles.iconColSpacer]} />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={goNext}>
              <View style={styles.optionRow}>
                <View style={styles.iconCol}>
                  <Ionicons name="mail" size={18} color={colors.black} />
                </View>
                <Text style={styles.optionText}>Log In with Email</Text>
                <View style={[styles.iconCol, styles.iconColSpacer]} />
              </View>
            </Pressable>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>New member? </Text>
            <Pressable onPress={goNext}>
              <Text style={styles.footerLink}>Create Account</Text>
            </Pressable>
          </View>
        </View>
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
  },
  center: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingTop: 130,
  },
  title: {
    marginBottom: 22,
    fontSize: 26,
    fontWeight: '400',
    color: colors.black,
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  option: {
    backgroundColor: colors.white,
    borderRadius: radii.control,
    paddingVertical: 11,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  iconCol: {
    width: ICON_COL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconColSpacer: {
    opacity: 0,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.black,
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.black,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
