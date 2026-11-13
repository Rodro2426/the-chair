import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';
import { accentPalette, type Accent } from './palette';

export interface GlossyButtonProps {
  title: string;
  onPress?: () => void;
  accent?: Accent;
  size?: 'md' | 'lg';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEIGHT = { md: 52, lg: 62 };

/**
 * The brand pill. Solid white with black mono label (voice/photo/text accents),
 * or a thin white outline (neutral) / coral outline (danger).
 */
export function GlossyButton({
  title, onPress, accent = 'voice', size = 'lg', icon, loading, disabled, style, testID,
}: GlossyButtonProps) {
  const p = accentPalette[accent];
  const inactive = disabled || loading;
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive }}
      disabled={inactive}
      onPress={onPress}
      hapticStyle="press"
      dimWhenDisabled={false}
      pressedScale={0.97}
      style={[
        styles.base,
        { height: HEIGHT[size] },
        p.outline
          ? { borderWidth: 1.5, borderColor: accent === 'danger' ? colors.danger : 'rgba(255,255,255,0.5)' }
          : { backgroundColor: p.solid },
        disabled && { opacity: 0.35 },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={p.label} />
        ) : (
          <>
            {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} color={p.label} strokeWidth={2.4} />}
            <Txt variant="label" color={p.label} style={{ fontSize: size === 'lg' ? 14 : 13 }}>{title}</Txt>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.sm, overflow: 'hidden', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm + 2, paddingHorizontal: space.lg },
});
