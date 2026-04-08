import { fonts } from '@/constants/fonts';
import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function DocumentVaultScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            onPress={() => { lightImpact(); router.back(); }}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={28} color={colors.black} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Documents</Text>
            <Text style={styles.headerSub}>Pull down to refresh</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.black} />
          }>
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={40} color={colors.primary} />
              <View style={styles.plusBadge}>
                <Ionicons name="add" size={14} color={colors.white} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyMeta}>Supported file type: PDF</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed]}
            onPress={() => lightImpact()}
            accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={20} color={colors.black} />
            <Text style={styles.uploadBtnText}>Upload Documents</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
            onPress={() => { lightImpact(); router.back(); }}
            accessibilityRole="button">
            <Ionicons name="ban-outline" size={18} color={colors.primary} />
            <Text style={styles.skipBtnText}>I don't have any documents</Text>
          </Pressable>

          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
            <Text style={styles.privacyText}>
              This is just for the UI in terms of cloning, not actually implemeted.
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: 26,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  headerSub: {
    fontFamily: mono,
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.2,
  },
  emptyMeta: {
    fontFamily: mono,
    fontSize: 13,
    color: 'rgba(0,0,0,0.45)',
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadBtnText: {
    fontFamily: mono,
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
  },
  skipBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  skipBtnText: {
    fontFamily: mono,
    fontSize: 17,
    fontWeight: '400',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  privacyText: {
    fontFamily: mono,
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    lineHeight: 17,
  },
});
