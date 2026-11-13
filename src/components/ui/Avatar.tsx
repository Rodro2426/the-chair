import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colorsUi, gradients, gradientsUi } from '@/theme/tokens';
import { Txt } from './Txt';

const options = [gradients.voice, gradients.photo, gradients.text] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pick(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

/** Glossy gradient initials avatar, color derived from the name. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient colors={pick(name)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradientsUi.gloss} style={styles.gloss} />
      <Txt variant="heading" color={colorsUi.onAccent} style={{ fontSize: size * 0.38 }}>{initials(name)}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colorsUi.highlightEdge },
  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: '50%' },
});
