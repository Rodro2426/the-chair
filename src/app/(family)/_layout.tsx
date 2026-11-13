import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { colors } from '@/theme/tokens';
import { ScreenBackground } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ChairsProvider } from '@/hooks/useChairs';

export default function FamilyLayout() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenBackground>
    );
  }
  if (!user) return <Redirect href="/welcome" />;
  return (
    <ChairsProvider uid={user.uid}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="home" options={{ animation: 'fade' }} />
        <Stack.Screen name="text" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="photo" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="link" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ChairsProvider>
  );
}
