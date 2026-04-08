import { mono, onboarding } from '@/constants/onboarding';
import { fonts } from '@/constants/fonts';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HARDCODED_RESPONSE =
  "Based on your health profile, your current life expectancy is 83 years. To improve this, I'd recommend focusing on consistent sleep (7–9 hrs), reducing processed foods, and adding 30 minutes of moderate cardio 4x per week. Your next recommended screening is a lipid panel — it's been over 12 months.";

type Message = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS: string[] = [
  'Your necessary preventative screenings',
  'An analysis of your sleep',
  'A summary of your overall health',
  'The best diet for you',
  'Supplements to consider',
  "Key topics for your next doctor's visit",
];

export default function AiConciergeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = (text?: string) => {
    const content = (text ?? message).trim();
    if (!content) return;
    lightImpact();
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', text: content }]);
    setThinking(true);
  };

  useEffect(() => {
    if (!thinking) return;
    const t = setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [...prev, { role: 'assistant', text: HARDCODED_RESPONSE }]);
    }, 1200);
    return () => clearTimeout(t);
  }, [thinking]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, thinking]);

  const showEmpty = messages.length === 0 && !thinking;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={[styles.inner, { paddingHorizontal: pad }]}>
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

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, showEmpty && styles.scrollContentCentered]}
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
              </View>
            )}
          </ScrollView>

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
              />
              <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
                onPress={() => send()}
                accessibilityRole="button"
                accessibilityLabel="Send">
                <Ionicons name="arrow-up" size={20} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  bulbWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
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
  thread: {
    paddingTop: 16,
    gap: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '75%',
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
  thinkingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextAssistant: {
    color: colors.black,
  },
  inputRow: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  inputBubble: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnPressed: {
    opacity: 0.88,
  },
});
