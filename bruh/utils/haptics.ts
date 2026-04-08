import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Light tap feedback — no-op on web */
export function lightImpact(): void {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
