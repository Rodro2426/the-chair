import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { colors } from '@/theme/tokens';
import { ScreenBackground } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getDeviceMode, type DeviceMode } from '@/hooks/deviceMode';

export default function Index() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<DeviceMode | null | undefined>(undefined);

  useEffect(() => { getDeviceMode().then(setMode); }, []);

  if (loading || mode === undefined) {
    return (
      <ScreenBackground>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.textFaint} />
        </View>
      </ScreenBackground>
    );
  }
  if (mode === 'chair') return <Redirect href={'/chair' as Href} />;
  if (user) return <Redirect href="/home" />;
  return <Redirect href="/welcome" />;
}
