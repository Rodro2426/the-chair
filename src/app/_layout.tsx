import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { colors } from '@/theme/tokens';
import { ToastProvider } from '@/components/ui';
import { AuthProvider } from '@/hooks/useAuth';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, primary: colors.primary, border: colors.cardBorder },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold, InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic });
  // Hold on graphite until the type is in (falls through on error so the app never blocks).
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <AuthProvider>
          <ToastProvider>
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }} />
            </View>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
