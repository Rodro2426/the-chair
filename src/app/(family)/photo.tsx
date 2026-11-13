import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, radius, space } from '@/theme/tokens';
import { GlossyButton, Icon, PressableScale, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
import { sendPhoto } from '@/lib/api';
import { useChairs } from '@/hooks/useChairs';
import { usePhotoSentToday } from '@/hooks/useMessages';
import { friendlyError } from '@/hooks/errors';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3], // the chair screen is landscape
  quality: 0.8,
};

export default function PhotoOfTheDay() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { selected } = useChairs();
  const sentToday = usePhotoSentToday(selected?.id, null);
  const [uri, setUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          toast.show('Camera access is off. You can turn it on in Settings, or pick from your library.', 'error');
          return;
        }
      }
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!res.canceled && res.assets[0]) setUri(res.assets[0].uri);
    } catch (e) {
      toast.show(friendlyError(e, source === 'camera' ? 'Couldn’t open the camera.' : 'Couldn’t open your photos.'), 'error');
    }
  };

  const send = async () => {
    if (!selected || !uri) return;
    setBusy(true);
    try {
      await sendPhoto(selected.id, uri, caption.trim() || undefined);
      toast.show(`Today’s photo is on ${selected.name}’s chair`, 'success');
      router.back();
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t send the photo. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
          <ScreenHeader close title="Photo of the day" subtitle={selected ? `For ${selected.name}` : undefined} />
          <View style={styles.body}>
            {sentToday && (
              <Animated.View entering={FadeIn} style={styles.banner}>
                <View style={styles.bannerHead}>
                  <Icon name="check" size={14} strokeWidth={2.6} />
                  <Txt variant="label" style={{ fontSize: 13 }}>Sent today</Txt>
                </View>
                <Txt variant="body" tone="muted" style={{ fontSize: 13 }}>A new one replaces today’s photo on the chair.</Txt>
              </Animated.View>
            )}

            {!uri ? (
              <>
                <Txt variant="display" style={styles.headline}>One photo.{'\n'}Every day.</Txt>
                <Txt variant="body" tone="muted">Shown big on the chair’s screen.</Txt>
                <View style={styles.list}>
                  <PressableScale onPress={() => pick('camera')} pressedScale={0.98} hapticStyle="select" style={styles.option} accessibilityRole="button" accessibilityLabel="Take a photo">
                    <Icon name="camera" size={22} strokeWidth={2} />
                    <Txt variant="label" style={styles.optionLabel}>Take a photo</Txt>
                    <Icon name="chevron" size={16} color={colors.textFaint} />
                  </PressableScale>
                  <PressableScale onPress={() => pick('library')} pressedScale={0.98} hapticStyle="select" style={styles.option} accessibilityRole="button" accessibilityLabel="Choose from library">
                    <Icon name="gallery" size={22} strokeWidth={2} />
                    <Txt variant="label" style={styles.optionLabel}>From library</Txt>
                    <Icon name="chevron" size={16} color={colors.textFaint} />
                  </PressableScale>
                </View>
              </>
            ) : (
              <>
                <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.previewWrap}>
                  <Image source={{ uri }} style={styles.preview} contentFit="cover" transition={200} />
                  {!!caption.trim() && (
                    <View style={styles.captionOverlay}>
                      <Txt variant="label" numberOfLines={2}>{caption.trim()}</Txt>
                    </View>
                  )}
                </Animated.View>
                <TextField label="Caption (optional)" placeholder="Lucas’s first day at school" value={caption}
                  onChangeText={(t) => setCaption(t.slice(0, 120))} returnKeyType="done" />
                <PressableScale onPress={() => setUri(null)} hapticStyle="select" style={{ alignSelf: 'center', padding: space.sm }}>
                  <Txt variant="label" tone="muted" style={{ fontSize: 13 }}>Choose another</Txt>
                </PressableScale>
              </>
            )}
          </View>
          <View style={{ flex: 1, minHeight: space.lg }} />
          {uri && (
            <View style={styles.body}>
              <GlossyButton title="Send photo" icon="send" accent="voice" loading={busy} disabled={!selected} onPress={send} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, maxWidth: 640, width: '100%', alignSelf: 'center' },
  body: { paddingHorizontal: space.lg, gap: space.lg },
  headline: { fontSize: 54, lineHeight: 58, marginTop: space.md },
  list: { marginTop: space.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.14)' },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.14)',
  },
  optionLabel: { flex: 1, fontSize: 16, letterSpacing: 2.4 },
  banner: { paddingVertical: space.md, paddingHorizontal: space.md, borderRadius: radius.sm, gap: 4, borderWidth: 1, borderColor: brand.divider },
  bannerHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  previewWrap: { borderRadius: radius.sm, overflow: 'hidden', backgroundColor: brand.black },
  preview: { width: '100%', aspectRatio: 4 / 3 },
  captionOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.md, backgroundColor: 'rgba(0,0,0,0.6)' },
});
