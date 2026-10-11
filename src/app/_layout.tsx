import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { palette } from '@/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.bg },
          headerTintColor: palette.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'GuitarLoop' }} />
        <Stack.Screen name="settings" options={{ title: 'Ajustes', presentation: 'modal' }} />
        <Stack.Screen name="collection/[id]" />
        <Stack.Screen name="song/[id]" />
        <Stack.Screen name="player/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
