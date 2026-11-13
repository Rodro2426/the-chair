import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { brand } from '@/theme/tokens';

const grain = require('../../../assets/grain.png');

/** Tiling film-grain overlay. Put it last inside a relatively-positioned container. */
export function Grain({ opacity = brand.grainOpacity, style }: { opacity?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity, overflow: 'hidden' }, style]}>
      <Image source={grain} resizeMode="repeat" style={styles.fill} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
