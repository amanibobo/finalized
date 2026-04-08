import { colors, radii } from '@/constants/theme';
import { mono } from '@/constants/onboarding';
import { FLASH_GREEN_BG, useFlashPress } from '@/hooks/useFlashPress';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
};

export function SelectionPill({ label, onPress }: Props) {
  const { flash, handlePress } = useFlashPress(onPress);

  return (
    <Pressable style={[styles.pill, flash && styles.flash]} onPress={handlePress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radii.control,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
  flash: {
    backgroundColor: FLASH_GREEN_BG,
  },
  text: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.black,
    textAlign: 'center',
    fontFamily: mono,
  },
});
