import { Alert, Platform } from 'react-native';

/** Cross-platform yes/no confirm (Alert buttons are a no-op on react-native-web). */
export function confirmAsync(title: string, message: string, confirmText = 'OK', destructive = false): Promise<boolean> {
  if (Platform.OS === 'web') {
    const g = globalThis as unknown as { confirm?: (m: string) => boolean };
    return Promise.resolve(g.confirm ? g.confirm(`${title}\n\n${message}`) : true);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}
