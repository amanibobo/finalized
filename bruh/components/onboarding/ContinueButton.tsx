import { colors, radii } from '@/constants/theme';
import { mono } from '@/constants/onboarding';
import { lightImpact } from '@/utils/haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
};

export function ContinueButton({ onPress, disabled, label = 'Continue →' }: Props) {
  const handlePress = () => {
    if (disabled) return;
    lightImpact();
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={handlePress}
      disabled={disabled}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontFamily: mono,
    fontSize: 17,
    fontWeight: '400',
    color: colors.black,
  },
});
