import { Stack } from 'expo-router';

export default function LifestyleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    />
  );
}
