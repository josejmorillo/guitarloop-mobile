import { useEvent, useEventListener } from 'expo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { api, streamUrl } from '@/api/client';
import type { Clip } from '@/api/types';
import { showError } from '@/components/ui';
import { useApiData } from '@/hooks/useApiData';
import { DEFAULT_SPEED_INDEX, formatSpeed, nearestSpeedIndex, palette, SPEEDS } from '@/theme';

export default function PlayerScreen() {
  const params = useLocalSearchParams<{ id?: string; song?: string; name?: string }>();
  const router = useRouter();

  const songId = params.song;
  const [clipId, setClipId] = useState(params.id ?? '');
  const [speedIndex, setSpeedIndex] = useState(DEFAULT_SPEED_INDEX);
  const [loop, setLoop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  // Evita reaplicar la velocidad sugerida tras un cambio manual.
  const appliedSuggested = useRef(false);

  const { data: clips } = useApiData<Clip[]>(
    () => (songId ? api.clips(songId) : Promise.resolve([])),
    [songId],
  );

  const currentClip = useMemo(
    () => clips?.find((clip) => clip.id === clipId) ?? null,
    [clips, clipId],
  );

  // `useVideoPlayer` recrea el player cuando cambia la fuente (clipId).
  // `preservesPitch` es OBLIGATORIO: en Android el valor nativo por defecto es `false`
  // y al ralentizar el audio sonaría grave/distorsionado.
  const player = useVideoPlayer(streamUrl(clipId), (instance) => {
    instance.preservesPitch = true;
    instance.loop = loop;
    instance.playbackRate = SPEEDS[speedIndex];
    instance.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Con el loop desactivado, al terminar el vídeo queda bloqueado: marcamos `ended`
  // para poder reiniciarlo con un toque.
  useEventListener(player, 'playToEnd', () => {
    if (!player.loop) setEnded(true);
  });

  useEffect(() => {
    if (isPlaying) setEnded(false);
  }, [isPlaying]);

  // Al cargar el clip, aplica su velocidad sugerida (una sola vez por clip).
  useEffect(() => {
    if (appliedSuggested.current) return;
    const suggested = currentClip?.suggested_speed;
    if (!suggested) return;
    appliedSuggested.current = true;
    const index = nearestSpeedIndex(suggested);
    player.playbackRate = SPEEDS[index];
    setSpeedIndex(index);
  }, [currentClip, player]);

  const togglePlay = () => {
    if (ended) {
      player.currentTime = 0;
      setEnded(false);
      player.play();
      return;
    }
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const changeSpeed = (delta: number) => {
    const next = Math.min(SPEEDS.length - 1, Math.max(0, speedIndex + delta));
    player.playbackRate = SPEEDS[next];
    setSpeedIndex(next);
  };

  const toggleLoop = () => {
    const next = !loop;
    player.loop = next;
    setLoop(next);
  };

  const selectClip = (clip: Clip) => {
    appliedSuggested.current = false;
    setEnded(false);
    setClipId(clip.id);
    setMenuOpen(false);
  };

  const handleDeleteClip = useCallback(() => {
    Alert.alert('Borrar clip', `¿Seguro que quieres borrar "${currentClip?.name ?? 'este clip'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteClip(clipId);
            router.back();
          } catch (error) {
            showError(error);
          }
        },
      },
    ]);
  }, [clipId, currentClip, router]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Tap en el vídeo = play/pause */}
      <Pressable style={StyleSheet.absoluteFill} onPress={togglePlay} />

      <View style={[styles.topBar, styles.boxNone]}>
        <Pressable hitSlop={12} style={styles.iconButton} onPress={() => router.back()}>
          <Text style={styles.iconText}>‹</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>
          {currentClip?.name ?? params.name ?? 'Clip'}
        </Text>
        <Pressable hitSlop={12} style={styles.iconButton} onPress={handleDeleteClip}>
          <Text style={styles.trashText}>🗑</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.control} onPress={() => changeSpeed(-1)}>
          <Text style={styles.controlText}>−</Text>
        </Pressable>
        <Text style={styles.speed}>{formatSpeed(SPEEDS[speedIndex])}</Text>
        <Pressable style={styles.control} onPress={() => changeSpeed(1)}>
          <Text style={styles.controlText}>+</Text>
        </Pressable>
        <Pressable style={[styles.control, loop && styles.controlActive]} onPress={toggleLoop}>
          <Text style={styles.controlText}>↻</Text>
        </Pressable>
        <Pressable style={styles.control} onPress={() => setMenuOpen(true)}>
          <Text style={styles.controlText}>☰</Text>
        </Pressable>
      </View>

      {ended && (
        <View style={styles.replay}>
          <Text style={styles.replayIcon}>▶</Text>
          <Text style={styles.replayText}>Toca para repetir</Text>
        </View>
      )}

      <Modal
        visible={menuOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Clips de este tema</Text>
          <FlatList
            data={clips ?? []}
            keyExtractor={(clip) => clip.id}
            ListEmptyComponent={<Text style={styles.dim}>Sin clips.</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.sheetRow, item.id === clipId && styles.sheetRowActive]}
                onPress={() => selectClip(item)}
              >
                <Text style={styles.sheetText}>{item.name}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  boxNone: { pointerEvents: 'box-none' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: '#fff', fontSize: 30, lineHeight: 32 },
  title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  controls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  control: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  controlActive: { backgroundColor: 'rgba(76,154,255,0.35)' },
  controlText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  speed: { color: '#fff', fontSize: 18, fontWeight: '700', minWidth: 62, textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: '55%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
    marginBottom: 12,
  },
  sheetTitle: { color: palette.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sheetRow: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6 },
  sheetRowActive: { backgroundColor: 'rgba(76,154,255,0.2)' },
  sheetText: { color: palette.text, fontSize: 16 },
  dim: { color: palette.textDim },
  trashText: { fontSize: 18 },
  replay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    alignItems: 'center',
    pointerEvents: 'none',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  replayIcon: { color: '#fff', fontSize: 40 },
  replayText: { color: '#fff', fontSize: 13, marginTop: 4 },
});
