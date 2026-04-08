import { CitationDrawer } from '@/components/onboarding/CitationDrawer';
import { mono } from '@/constants/onboarding';
import type { ResolvedDrawerPayload } from '@/constants/lifestyleQuestions';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
  payload: ResolvedDrawerPayload;
};

/**
 * Tappable study line — opens Impact Score drawer.
 */
export function StudyCitation({ text, payload }: Props) {
  const [open, setOpen] = useState(false);

  const openDrawer = () => {
    lightImpact();
    setOpen(true);
  };

  return (
    <View>
      <Pressable
        onPress={openDrawer}
        style={styles.row}
        accessibilityRole="button"
        accessibilityLabel="View impact score and research details"
        accessibilityHint="Opens impact score and study information">
        <Ionicons
          name="document-text-outline"
          size={18}
          color="rgba(0,0,0,0.72)"
          style={styles.icon}
        />
        <Text style={styles.caption}>{text}</Text>
      </Pressable>
      <CitationDrawer
        visible={open}
        onClose={() => setOpen(false)}
        impactScore={payload.impactScore}
        impactDescription={payload.impactDescription}
        whyImportant={payload.whyImportant}
        sourceLabel={payload.sourceLabel}
        sourceUrl={payload.sourceUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    maxWidth: '100%',
  },
  icon: {
    marginTop: 1,
  },
  caption: {
    flex: 1,
    fontFamily: mono,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400',
    color: 'rgba(0,0,0,0.72)',
    letterSpacing: 0.2,
  },
});
