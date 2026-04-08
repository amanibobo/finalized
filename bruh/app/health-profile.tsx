import { fonts } from '@/constants/fonts';
import { LIFESTYLE_STEPS } from '@/constants/lifestyleQuestions';
import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import {
  useOnboardingStore,
  type HeightValue,
  type OnboardingAnswers,
} from '@/store/onboardingStore';
import { predictDeathClock } from '@/utils/api';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IonName = ComponentProps<typeof Ionicons>['name'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOptionsForKey(key: keyof OnboardingAnswers): string[] {
  return LIFESTYLE_STEPS.find((s) => s.questionnaireKey === (key as string))?.options ?? [];
}

function formatHeight(a: Partial<OnboardingAnswers>): string | undefined {
  if (a.height_value === undefined) return undefined;
  if (a.height_unit === 'ft_in' && Array.isArray(a.height_value)) {
    const [ft, inc] = a.height_value as [number, number];
    return `${ft}ft ${inc}in`;
  }
  if (a.height_unit === 'm') return `${a.height_value}m`;
  return `${a.height_value}cm`;
}

function formatWeight(a: Partial<OnboardingAnswers>): string | undefined {
  if (a.weight_value === undefined) return undefined;
  return `${a.weight_value}${a.weight_unit === 'kg' ? 'kg' : 'lbs'}`;
}

function formatSex(a: Partial<OnboardingAnswers>): string | undefined {
  if (!a.sex) return undefined;
  return a.sex.charAt(0).toUpperCase() + a.sex.slice(1);
}

// ── Field definitions ─────────────────────────────────────────────────────────

type FieldType = 'text' | 'number' | 'select' | 'sex' | 'height' | 'weight';

type FieldDef = {
  label: string;
  type: FieldType;
  storeKey?: keyof OnboardingAnswers;
  options?: string[];
  getValue: (a: Partial<OnboardingAnswers>) => string | undefined;
};

const SECTION_DEFS: Array<{ title: string; icon: IonName; fields: FieldDef[] }> = [
  {
    title: 'Basic',
    icon: 'person-outline',
    fields: [
      { label: 'Name', type: 'text', storeKey: 'first_name', getValue: (a) => a.first_name },
      {
        label: 'Age',
        type: 'number',
        storeKey: 'age',
        getValue: (a) => (a.age !== undefined ? String(a.age) : undefined),
      },
      { label: 'Gender', type: 'sex', options: ['Female', 'Male'], getValue: formatSex },
      { label: 'Height', type: 'height', getValue: formatHeight },
      { label: 'Weight', type: 'weight', getValue: formatWeight },
    ],
  },
  {
    title: 'Healthcare',
    icon: 'pulse-outline',
    fields: [
      {
        label: 'Lifespan of Biological Grandparents',
        type: 'select',
        storeKey: 'grandparents_max_age',
        options: getOptionsForKey('grandparents_max_age'),
        getValue: (a) => a.grandparents_max_age,
      },
    ],
  },
  {
    title: 'Diet',
    icon: 'restaurant-outline',
    fields: [
      {
        label: 'Daily Sugar Intake',
        type: 'select',
        storeKey: 'diet_sugar',
        options: getOptionsForKey('diet_sugar'),
        getValue: (a) => a.diet_sugar,
      },
      {
        label: 'Frequency of Fruits and Veggies in Meals',
        type: 'select',
        storeKey: 'diet_fruits_veggies',
        options: getOptionsForKey('diet_fruits_veggies'),
        getValue: (a) => a.diet_fruits_veggies,
      },
      {
        label: 'Frequency of Eating Processed Foods',
        type: 'select',
        storeKey: 'diet_processed_foods',
        options: getOptionsForKey('diet_processed_foods'),
        getValue: (a) => a.diet_processed_foods,
      },
      {
        label: 'Daily Water Intake',
        type: 'select',
        storeKey: 'diet_water',
        options: getOptionsForKey('diet_water'),
        getValue: (a) => a.diet_water,
      },
    ],
  },
  {
    title: 'Exercise',
    icon: 'walk-outline',
    fields: [
      {
        label: 'Frequency of Cardio Exercise',
        type: 'select',
        storeKey: 'exercise_cardio',
        options: getOptionsForKey('exercise_cardio'),
        getValue: (a) => a.exercise_cardio,
      },
      {
        label: 'Frequency of Yoga or Stretching',
        type: 'select',
        storeKey: 'exercise_mobility',
        options: getOptionsForKey('exercise_mobility'),
        getValue: (a) => a.exercise_mobility,
      },
      {
        label: 'Daily Sitting Duration',
        type: 'select',
        storeKey: 'exercise_sitting',
        options: getOptionsForKey('exercise_sitting'),
        getValue: (a) => a.exercise_sitting,
      },
      {
        label: 'Frequency of Weightlifting',
        type: 'select',
        storeKey: 'exercise_weights',
        options: getOptionsForKey('exercise_weights'),
        getValue: (a) => a.exercise_weights,
      },
    ],
  },
  {
    title: 'Sleep',
    icon: 'bed-outline',
    fields: [
      {
        label: 'Frequency of Getting at Least 7 Hours of Sleep',
        type: 'select',
        storeKey: 'sleep_duration',
        options: getOptionsForKey('sleep_duration'),
        getValue: (a) => a.sleep_duration,
      },
      {
        label: 'Frequency of Trouble Falling or Staying Asleep',
        type: 'select',
        storeKey: 'sleep_trouble',
        options: getOptionsForKey('sleep_trouble'),
        getValue: (a) => a.sleep_trouble,
      },
    ],
  },
  {
    title: 'Community',
    icon: 'people-outline',
    fields: [
      {
        label: 'Frequency of Spending Time with Friends & Family',
        type: 'select',
        storeKey: 'community_time',
        options: getOptionsForKey('community_time'),
        getValue: (a) => a.community_time,
      },
      {
        label: 'Supportiveness of Social Circle',
        type: 'select',
        storeKey: 'social_support',
        options: getOptionsForKey('social_support'),
        getValue: (a) => a.social_support,
      },
      {
        label: 'Relationship Status',
        type: 'select',
        storeKey: 'relationship_status',
        options: getOptionsForKey('relationship_status'),
        getValue: (a) => a.relationship_status,
      },
      {
        label: 'Children',
        type: 'select',
        storeKey: 'children',
        options: getOptionsForKey('children'),
        getValue: (a) => a.children,
      },
    ],
  },
  {
    title: 'Mental Health',
    icon: 'happy-outline',
    fields: [
      {
        label: 'Impact of Mental Health on Well-Being',
        type: 'select',
        storeKey: 'mental_health_impact',
        options: getOptionsForKey('mental_health_impact'),
        getValue: (a) => a.mental_health_impact,
      },
      {
        label: 'Frequency of Experiencing Significant Stress',
        type: 'select',
        storeKey: 'stress',
        options: getOptionsForKey('stress'),
        getValue: (a) => a.stress,
      },
    ],
  },
  {
    title: 'Substance Use',
    icon: 'glasses-outline',
    fields: [
      {
        label: 'Weekly Alcoholic Drinks Consumption',
        type: 'select',
        storeKey: 'alcohol',
        options: getOptionsForKey('alcohol'),
        getValue: (a) => a.alcohol,
      },
      {
        label: 'Nicotine Use Status',
        type: 'select',
        storeKey: 'nicotine',
        options: getOptionsForKey('nicotine'),
        getValue: (a) => a.nicotine,
      },
    ],
  },
  {
    title: 'Disease',
    icon: 'star-outline',
    fields: [
      {
        label: 'Typical Blood Pressure Reading',
        type: 'select',
        storeKey: 'blood_pressure',
        options: getOptionsForKey('blood_pressure'),
        getValue: (a) => a.blood_pressure,
      },
      {
        label: 'Typical LDL Cholesterol Level',
        type: 'select',
        storeKey: 'ldl',
        options: getOptionsForKey('ldl'),
        getValue: (a) => a.ldl,
      },
      {
        label: 'Typical Fasting Blood Glucose Level',
        type: 'select',
        storeKey: 'glucose',
        options: getOptionsForKey('glucose'),
        getValue: (a) => a.glucose,
      },
      {
        label: 'Overweight Status',
        type: 'select',
        storeKey: 'overweight',
        options: getOptionsForKey('overweight'),
        getValue: (a) => a.overweight,
      },
      {
        label: 'Other Chronic Diseases',
        type: 'select',
        storeKey: 'chronic_disease',
        options: getOptionsForKey('chronic_disease'),
        getValue: (a) => a.chronic_disease,
      },
    ],
  },
];

// ── Edit modal state ──────────────────────────────────────────────────────────

type EditModal =
  | null
  | { type: 'text' | 'number'; field: FieldDef; draft: string }
  | { type: 'select' | 'sex'; field: FieldDef; options: string[]; draft: string }
  | { type: 'height'; field: FieldDef; unit: 'ft' | 'm'; feet: string; inches: string; meters: string }
  | { type: 'weight'; field: FieldDef; unit: 'kg' | 'lb'; draft: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT = colors.primary;
const MISSING_COLOR = '#D9363E';

// ── Component ─────────────────────────────────────────────────────────────────

export default function HealthProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  const answers = useOnboardingStore((s) => s.answers);
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const setAnswers = useOnboardingStore((s) => s.setAnswers);
  const setPrediction = useOnboardingStore((s) => s.setPrediction);

  const [editModal, setEditModal] = useState<EditModal>(null);
  const [saving, setSaving] = useState(false);

  const refreshPrediction = useCallback(
    async (updated: Partial<OnboardingAnswers>) => {
      setSaving(true);
      try {
        const result = await predictDeathClock(updated);
        setPrediction(result);
      } catch {
        // best-effort — prediction refresh silently fails
      } finally {
        setSaving(false);
      }
    },
    [setPrediction],
  );

  const openEdit = useCallback(
    (field: FieldDef) => {
      lightImpact();
      const { type } = field;
      if (type === 'text' || type === 'number') {
        setEditModal({ type, field, draft: field.getValue(answers) ?? '' });
      } else if (type === 'select') {
        setEditModal({
          type: 'select',
          field,
          options: field.options ?? [],
          draft: field.getValue(answers) ?? '',
        });
      } else if (type === 'sex') {
        setEditModal({
          type: 'sex',
          field,
          options: field.options ?? ['Female', 'Male'],
          draft: formatSex(answers) ?? '',
        });
      } else if (type === 'height') {
        const hv = answers.height_value;
        const hu = answers.height_unit;
        if (hu === 'ft_in' && Array.isArray(hv)) {
          const [ft, inc] = hv as [number, number];
          setEditModal({ type: 'height', field, unit: 'ft', feet: String(ft), inches: String(inc), meters: '' });
        } else if (hu === 'm' && hv !== undefined) {
          setEditModal({ type: 'height', field, unit: 'm', feet: '', inches: '', meters: String(hv) });
        } else {
          setEditModal({ type: 'height', field, unit: 'ft', feet: '5', inches: '10', meters: '' });
        }
      } else if (type === 'weight') {
        setEditModal({
          type: 'weight',
          field,
          unit: (answers.weight_unit as 'kg' | 'lb') ?? 'lb',
          draft: answers.weight_value !== undefined ? String(answers.weight_value) : '',
        });
      }
    },
    [answers],
  );

  const commitEdit = useCallback(async () => {
    if (!editModal) return;
    let updated = { ...answers };

    if (editModal.type === 'text') {
      const key = editModal.field.storeKey!;
      setAnswer(key, editModal.draft as OnboardingAnswers[typeof key]);
      updated = { ...updated, [key]: editModal.draft };
    } else if (editModal.type === 'number') {
      const key = editModal.field.storeKey!;
      const num = parseFloat(editModal.draft);
      if (!isNaN(num)) {
        setAnswer(key, num as OnboardingAnswers[typeof key]);
        updated = { ...updated, [key]: num };
      }
    } else if (editModal.type === 'height') {
      if (editModal.unit === 'ft') {
        const hv: HeightValue = [
          parseInt(editModal.feet || '0', 10),
          parseInt(editModal.inches || '0', 10),
        ];
        setAnswers({ height_value: hv, height_unit: 'ft_in' });
        updated = { ...updated, height_value: hv, height_unit: 'ft_in' };
      } else {
        const hv = parseFloat(editModal.meters || '0');
        setAnswers({ height_value: hv, height_unit: 'm' });
        updated = { ...updated, height_value: hv, height_unit: 'm' };
      }
    } else if (editModal.type === 'weight') {
      const wv = parseFloat(editModal.draft || '0');
      setAnswers({ weight_value: wv, weight_unit: editModal.unit });
      updated = { ...updated, weight_value: wv, weight_unit: editModal.unit };
    }

    setEditModal(null);
    await refreshPrediction(updated);
  }, [editModal, answers, setAnswer, setAnswers, refreshPrediction]);

  const selectOption = useCallback(
    async (option: string) => {
      if (!editModal || (editModal.type !== 'select' && editModal.type !== 'sex')) return;
      let updated = { ...answers };

      if (editModal.type === 'select') {
        const key = editModal.field.storeKey!;
        setAnswer(key, option as OnboardingAnswers[typeof key]);
        updated = { ...updated, [key]: option };
      } else {
        const lower = option.toLowerCase();
        setAnswer('sex', lower);
        updated = { ...updated, sex: lower };
      }

      setEditModal(null);
      await refreshPrediction(updated);
    },
    [editModal, answers, setAnswer, refreshPrediction],
  );

  const missingCount = SECTION_DEFS.flatMap((s) => s.fields).filter(
    (f) => f.getValue(answers) === undefined,
  ).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            onPress={() => { lightImpact(); router.back(); }}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={28} color={colors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Health Profile</Text>
          {saving ? (
            <ActivityIndicator size="small" color={ACCENT} style={styles.headerRight} />
          ) : missingCount > 0 ? (
            <View style={[styles.badge, styles.headerRight]}>
              <Text style={styles.badgeText}>{missingCount}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Sections ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {SECTION_DEFS.map((section) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon} size={26} color={ACCENT} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.fieldGroup}>
                {section.fields.map((field) => {
                  const value = field.getValue(answers);
                  const missing = value === undefined;
                  return (
                    <Pressable
                      key={field.label}
                      style={styles.fieldCard}
                      onPress={() => openEdit(field)}
                      accessibilityRole="button">
                      <View style={styles.fieldCardInner}>
                        <View style={styles.fieldTextCol}>
                          <Text style={styles.fieldLabel}>{field.label}</Text>
                          {missing ? (
                            <View style={styles.missingRow}>
                              <Ionicons name="warning-outline" size={13} color={MISSING_COLOR} />
                              <Text style={styles.missingText}>Missing Information</Text>
                            </View>
                          ) : (
                            <Text style={styles.fieldValue}>{value}</Text>
                          )}
                        </View>
                        <Ionicons name="chevron-down" size={18} color="rgba(0,0,0,0.35)" />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Edit Modal ── */}
      <Modal
        visible={editModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal(null)}>
        <Pressable style={styles.overlay} onPress={() => setEditModal(null)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>

              {/* Sheet header */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {editModal?.field.label}
                </Text>
                <Pressable hitSlop={12} onPress={() => setEditModal(null)}>
                  <Ionicons name="close" size={24} color={colors.black} />
                </Pressable>
              </View>

              {/* Option picker (select / sex) */}
              {(editModal?.type === 'select' || editModal?.type === 'sex') && (
                <ScrollView
                  style={styles.optionScroll}
                  contentContainerStyle={styles.optionList}
                  showsVerticalScrollIndicator={false}>
                  {editModal.options.map((opt) => {
                    const isSelected =
                      editModal.draft === opt ||
                      (editModal.type === 'sex' && opt.toLowerCase() === answers.sex);
                    return (
                      <Pressable
                        key={opt}
                        style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                        onPress={() => { lightImpact(); selectOption(opt); }}>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {opt}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color={colors.white} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Height editor */}
              {editModal?.type === 'height' && (
                <View style={styles.inputArea}>
                  <View style={styles.toggleRow}>
                    {(['ft', 'm'] as const).map((u) => (
                      <Pressable
                        key={u}
                        style={[styles.toggleChip, editModal.unit === u && styles.toggleChipOn]}
                        onPress={() => { lightImpact(); setEditModal({ ...editModal, unit: u }); }}>
                        <Text style={styles.toggleLabel}>
                          {u === 'ft' ? 'Feet / Inches' : 'Meters'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {editModal.unit === 'ft' ? (
                    <View style={styles.rowInputs}>
                      <View style={[styles.inputShell, styles.halfInput]}>
                        <TextInput
                          style={styles.numInput}
                          value={editModal.feet}
                          onChangeText={(v) => setEditModal({ ...editModal, feet: v })}
                          keyboardType="number-pad"
                          maxLength={1}
                          placeholder="5"
                          placeholderTextColor="rgba(0,0,0,0.3)"
                          autoFocus
                        />
                        <Text style={styles.unitLabel}>ft</Text>
                      </View>
                      <View style={[styles.inputShell, styles.halfInput]}>
                        <TextInput
                          style={styles.numInput}
                          value={editModal.inches}
                          onChangeText={(v) => setEditModal({ ...editModal, inches: v })}
                          keyboardType="number-pad"
                          maxLength={2}
                          placeholder="10"
                          placeholderTextColor="rgba(0,0,0,0.3)"
                        />
                        <Text style={styles.unitLabel}>in</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.inputShell}>
                      <TextInput
                        style={[styles.numInput, { flex: 1 }]}
                        value={editModal.meters}
                        onChangeText={(v) => setEditModal({ ...editModal, meters: v })}
                        keyboardType="decimal-pad"
                        placeholder="1.75"
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        autoFocus
                      />
                      <Text style={styles.unitLabel}>m</Text>
                    </View>
                  )}
                  <Pressable style={styles.saveBtn} onPress={commitEdit}>
                    <Text style={styles.saveBtnText}>Save & Refresh Prediction</Text>
                  </Pressable>
                </View>
              )}

              {/* Weight editor */}
              {editModal?.type === 'weight' && (
                <View style={styles.inputArea}>
                  <View style={styles.toggleRow}>
                    {(['lb', 'kg'] as const).map((u) => (
                      <Pressable
                        key={u}
                        style={[styles.toggleChip, editModal.unit === u && styles.toggleChipOn]}
                        onPress={() => { lightImpact(); setEditModal({ ...editModal, unit: u }); }}>
                        <Text style={styles.toggleLabel}>{u}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.inputShell}>
                    <TextInput
                      style={[styles.numInput, { flex: 1 }]}
                      value={editModal.draft}
                      onChangeText={(v) => setEditModal({ ...editModal, draft: v })}
                      keyboardType="number-pad"
                      placeholder="140"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      autoFocus
                    />
                    <Text style={styles.unitLabel}>{editModal.unit}</Text>
                  </View>
                  <Pressable style={styles.saveBtn} onPress={commitEdit}>
                    <Text style={styles.saveBtnText}>Save & Refresh Prediction</Text>
                  </Pressable>
                </View>
              )}

              {/* Text / number editor */}
              {(editModal?.type === 'text' || editModal?.type === 'number') && (
                <View style={styles.inputArea}>
                  <View style={styles.inputShell}>
                    <TextInput
                      style={[styles.numInput, { flex: 1 }]}
                      value={editModal.draft}
                      onChangeText={(v) => setEditModal({ ...editModal, draft: v })}
                      keyboardType={editModal.type === 'number' ? 'number-pad' : 'default'}
                      placeholder={editModal.field.label}
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      autoFocus
                    />
                  </View>
                  <Pressable style={styles.saveBtn} onPress={commitEdit}>
                    <Text style={styles.saveBtnText}>Save & Refresh Prediction</Text>
                  </Pressable>
                </View>
              )}

            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: 26,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.4,
    flex: 1,
  },
  headerRight: {
    marginLeft: 'auto',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MISSING_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, gap: 28 },

  // Section
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: 22,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.3,
  },

  // Field cards
  fieldGroup: { gap: 8 },
  fieldCard: {
    backgroundColor: colors.white,
    borderRadius: radii.sheet,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldCardInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldTextCol: { flex: 1, gap: 3 },
  fieldLabel: {
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '400',
    color: ACCENT,
    lineHeight: 19,
  },
  fieldValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '400',
    color: colors.black,
  },
  missingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  missingText: { fontFamily: mono, fontSize: 13, color: MISSING_COLOR },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontFamily: fonts.regular,
    fontSize: 20,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.3,
    flex: 1,
  },

  // Option picker
  optionScroll: { maxHeight: 360 },
  optionList: { gap: 10, paddingBottom: 8 },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.sheet,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionPillSelected: { backgroundColor: ACCENT },
  optionText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.black,
  },
  optionTextSelected: { color: colors.white },

  // Input editors
  inputArea: { gap: 16, paddingBottom: 4 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.sheet,
    backgroundColor: colors.white,
  },
  toggleChipOn: { backgroundColor: ACCENT },
  toggleLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.black,
  },
  rowInputs: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radii.sheet,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  numInput: {
    fontSize: 22,
    fontWeight: '400',
    color: colors.black,
    textAlign: 'center',
    minWidth: 40,
  },
  unitLabel: {
    fontFamily: mono,
    fontSize: 15,
    color: 'rgba(0,0,0,0.45)',
  },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: radii.sheet,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: -0.2,
  },
});
