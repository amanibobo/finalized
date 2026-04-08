import { colors } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  /** Defaults to `router.back()` after haptic */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Chevron color (e.g. white on dark hero screens) */
  color?: string;
};

export function ScreenBackButton({
  onPress,
  accessibilityLabel = 'Go back',
  color = colors.black,
}: Props) {
  const router = useRouter();

  const handlePress = () => {
    lightImpact();
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={14}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <Text style={[styles.chevron, { color }]}>{'\u2039'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    marginLeft: -6,
    marginBottom: 4,
  },
  pressed: {
    opacity: 0.65,
  },
  chevron: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '300',
  },
});
