import { AppColors } from '@/constants/colors';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.2, 90);

export default function LoaderScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [opacity, scale]);

  useEffect(() => {
    const id = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, 700);
    return () => clearTimeout(id);
  }, [scale]);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/init');
    }, 2800);
    return () => clearTimeout(t);
  }, [router]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, animatedLogoStyle]}>
        <Image
          source={require('@/assets/images/logo-dc-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
