import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, colorsUi, radius, shadow, space } from '@/theme/tokens';
import { ActionTile } from '@/components/family';
import { Card, GlossyButton, PressableScale, ScreenBackground, ScreenHeader, TextField, Txt, useToast } from '@/components/ui';
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
      toast.show(`Today’s photo is on ${selected.name}’s chair 🌅`, 'success');
      router.back();
    } catch (e) {
      toast.show(friendlyError(e, 'Couldn’t send the photo. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground glow="photo">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
          <ScreenHeader close title="Photo of the day" subtitle={selected ? `For ${selected.name}` : undefined} />
          <View style={styles.body}>
            {sentToday && (
              <Animated.View entering={FadeIn} style={styles.banner}>
                <Txt variant="body" tone="success" style={{ fontWeight: '800' }}>Sent today ✓</Txt>
                <Txt variant="caption" tone="muted">Sending another one will replace today’s photo on the chair.</Txt>
              </Animated.View>
            )}

            {!uri ? (
              <>
                <Txt variant="body" tone="muted" style={{ fontSize: 18, lineHeight: 26 }}>
                  One photo a day, shown big on the chair’s screen. Make it a good one!
                </Txt>
                <View style={styles.tiles}>
                  <ActionTile title="Take a photo" subtitle="Use the camera" icon="camera" accent="photo" onPress={() => pick('camera')} />
                  <ActionTile title="From library" subtitle="Pick a favorite" icon="gallery" accent="voice" onPress={() => pick('library')} />
                </View>
              </>
            ) : (
              <>
                <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.previewWrap, shadow.card]}>
                  <Image source={{ uri }} style={styles.preview} contentFit="cover" transition={200} />
                  {!!caption.trim() && (
                    <View style={styles.captionOverlay}>
                      <Txt variant="heading" numberOfLines={2}>{caption.trim()}</Txt>
                    </View>
                  )}
                </Animated.View>
                <Card style={{ padding: space.md }}>
                  <TextField label="Caption (optional)" placeholder="e.g. Lucas’s first day at school!" value={caption}
                    onChangeText={(t) => setCaption(t.slice(0, 120))} returnKeyType="done" />
                </Card>
                <PressableScale onPress={() => setUri(null)} hapticStyle="select" style={{ alignSelf: 'center', padding: space.sm }}>
                  <Txt variant="body" tone="secondary" style={{ fontWeight: '800' }}>Choose a different photo</Txt>
                </PressableScale>
              </>
            )}
          </View>
          <View style={{ flex: 1, minHeight: space.lg }} />
          {uri && (
            <View style={styles.body}>
              <GlossyButton title="Send photo" icon="send" accent="photo" loading={busy} disabled={!selected} onPress={send} />
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
  tiles: { flexDirection: 'row', gap: space.md },
  banner: {
    padding: space.md, borderRadius: radius.md, gap: 4,
    backgroundColor: colorsUi.inputBg, borderWidth: 1, borderColor: colors.success,
  },
  previewWrap: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder, backgroundColor: colors.card },
  preview: { width: '100%', aspectRatio: 4 / 3 },
  captionOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.md, backgroundColor: colorsUi.scrim },
});
