import { fonts, fontSources } from '@/constants/fonts';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fonts.regular]: fontSources.regular,
    [fonts.mono]: fontSources.mono,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!loaded || error) return;
    const family = fonts.regular;
    const T = Text as typeof Text & { defaultProps?: { style?: unknown } };
    const TI = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
    T.defaultProps = {
      ...T.defaultProps,
      style: [T.defaultProps?.style, { fontFamily: family }],
    };
    TI.defaultProps = {
      ...TI.defaultProps,
      style: [TI.defaultProps?.style, { fontFamily: family }],
    };
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="init"
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen name="login" />
        <Stack.Screen name="next" />
        <Stack.Screen name="life-lab" />
        <Stack.Screen name="ai-concierge" />
        <Stack.Screen name="health-profile" />
        <Stack.Screen name="document-vault" />
        <Stack.Screen name="longevity-report" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
