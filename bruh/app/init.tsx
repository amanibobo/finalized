import { initHeroHeadingFontSize } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = require('@/assets/images/init-screen-bg.png');

export default function InitScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));
  const headingSize = initHeroHeadingFontSize(width);

  const goLogin = () => {
    lightImpact();
    router.push('/login');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.scrim} />
        <SafeAreaView style={[styles.safe, { paddingHorizontal: pad }]} edges={['top', 'left', 'right']}>
          <View style={styles.bottom}>
            <Text
              style={[
                styles.headline,
                { fontSize: headingSize, lineHeight: headingSize + 12 },
              ]}>
              We predict{'\n'}
              {"when you'll die."}
            </Text>
            <Text style={styles.sub}>
              Then we help you <Text style={styles.subBold}>live longer</Text>
              {'\n'}— starting today
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
              onPress={goLogin}>
              <Text style={styles.primaryText}>See My Death Date & Plan</Text>
            </Pressable>
            <Pressable style={styles.linkWrap} onPress={goLogin}>
              <Text style={styles.link}>Log In</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  safe: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 36,
  },
  headline: {
    fontWeight: '400',
    color: colors.cream,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  sub: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.cream,
    lineHeight: 30,
    marginBottom: 28,
  },
  subBold: {
    fontWeight: '700',
    color: colors.cream,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: {
    opacity: 0.92,
  },
  primaryText: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.black,
  },
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.primary,
  },
});
