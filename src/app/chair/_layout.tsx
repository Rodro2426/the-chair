import { Stack } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme/tokens';
import { WebAudioUnlock } from '@/components/chair/WebAudioUnlock';

/** Chair (receiver) mode: no headers, no gestures, screen always on. */
export default function ChairLayout() {
  useKeepAwake('the-chair-receiver');
  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
      <WebAudioUnlock />
    </>
  );
}
