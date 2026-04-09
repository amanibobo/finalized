import { fonts } from '@/constants/fonts';
import { mono, onboarding } from '@/constants/onboarding';
import { colors } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { chatWithConcierge } from '@/utils/api';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS: string[] = [
  'Your necessary preventative screenings and analysis of your sleep',
  'A summary of your overall health',
  'The best diet for you',
  'Supplements to consider',
  "Key topics for your next doctor's visit",
];

export default function AiConciergeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  const answers = useOnboardingStore((s) => s.answers);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content || thinking) return;

    lightImpact();
    setMessage('');
    setError(null);

    const userMsg: Message = { role: 'user', text: content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setThinking(true);
    scrollToBottom();

    // Build the history in the format the API expects
    const history = updatedMessages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    try {
      const { reply } = await chatWithConcierge(answers, history);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setThinking(false);
      scrollToBottom();
    }
  };

  const showEmpty = messages.length === 0 && !thinking;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={[styles.inner, { paddingHorizontal: pad }]}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Pressable
              style={styles.backBtn}
              hitSlop={12}
              onPress={() => { lightImpact(); router.back(); }}
              accessibilityRole="button"
              accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={28} color={colors.black} />
            </Pressable>
            <Text style={styles.headerTitle}>AI Concierge</Text>
          </View>

          {/* ── Chat area ── */}
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              showEmpty && styles.scrollContentCentered,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {showEmpty ? (
              <>
                <View style={styles.bulbWrap}>
                  <View style={styles.bulbCircle}>
                    <Ionicons name="bulb-outline" size={22} color={onboarding.unitGray} />
                  </View>
                </View>
                <Text style={styles.prompt}>You might ask about:</Text>
                <View style={styles.list}>
                  {SUGGESTIONS.map((item, i) => (
                    <Pressable key={i} onPress={() => send(item)}>
                      <Text style={styles.listText}>{'• '}{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.thread}>
                {messages.map((msg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bubbleRow,
                      msg.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAssistant,
                    ]}>
                    <View
                      style={[
                        styles.bubble,
                        msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                      ]}>
                      <Text
                        style={[
                          styles.bubbleText,
                          msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                        ]}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                ))}

                {thinking && (
                  <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
                    <View style={[styles.bubble, styles.bubbleAssistant, styles.thinkingBubble]}>
                      <ActivityIndicator size="small" color={onboarding.unitGray} />
                    </View>
                  </View>
                )}

                {error && (
                  <View style={styles.errorRow}>
                    <Ionicons name="warning-outline" size={14} color="#D9363E" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* ── Input bar ── */}
          <View style={styles.inputRow}>
            <View style={styles.inputBubble}>
              <TextInput
                style={styles.input}
                placeholder="Ask a question"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={message}
                onChangeText={setMessage}
                returnKeyType="send"
                onSubmitEditing={() => send()}
                multiline
              />
              <Pressable
                style={({ pressed }) => [styles.sendBtn, (pressed || thinking) && styles.sendBtnDim]}
                onPress={() => send()}
                disabled={thinking}
                accessibilityRole="button"
                accessibilityLabel="Send">
                {thinking ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="arrow-up" size={20} color={colors.white} />
                )}
              </Pressable>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
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
    gap: 4,
    paddingVertical: 8,
    minHeight: 44,
  },
  backBtn: {},
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: 20,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.3,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },

  // Empty state
  bulbWrap: { alignItems: 'center', marginBottom: 14 },
  bulbCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  prompt: {
    fontFamily: fonts.regular,
    fontSize: 17,
    fontWeight: '400',
    color: onboarding.unitGray,
    textAlign: 'center',
    marginBottom: 14,
  },
  list: {
    alignSelf: 'center',
    maxWidth: 300,
    width: '100%',
    gap: 9,
  },
  listText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: onboarding.unitGray,
    textAlign: 'center',
  },

  // Thread
  thread: { paddingTop: 16, gap: 12 },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  thinkingBubble: { paddingHorizontal: 16, paddingVertical: 12 },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bubbleTextUser: { color: colors.white },
  bubbleTextAssistant: { color: colors.black },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: mono,
    fontSize: 13,
    color: '#D9363E',
    flex: 1,
  },

  // Input
  inputRow: {
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
  inputBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 6,
    paddingLeft: 18,
    paddingRight: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '400',
    color: colors.black,
    minHeight: 38,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  sendBtnDim: { opacity: 0.6 },
  disclaimer: {
    fontFamily: mono,
    fontSize: 11,
    color: 'rgba(0,0,0,0.35)',
    textAlign: 'center',
  },
});
