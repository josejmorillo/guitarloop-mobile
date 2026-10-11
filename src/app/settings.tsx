import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '@/api/client';
import { useSettings } from '@/store/settings';
import { palette } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const serverUrl = useSettings((state) => state.serverUrl);
  const setServerUrl = useSettings((state) => state.setServerUrl);
  const [draft, setDraft] = useState(serverUrl);
  const [testing, setTesting] = useState(false);

  const save = () => {
    setServerUrl(draft);
    router.back();
  };

  const test = async () => {
    setServerUrl(draft);
    setTesting(true);
    try {
      await api.health();
      Alert.alert('Conexión correcta', 'El servidor responde.');
    } catch (error) {
      Alert.alert('Error de conexión', error instanceof Error ? error.message : 'Fallo desconocido');
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dirección del servidor</Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="http://192.168.31.x:4000"
        placeholderTextColor={palette.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={styles.input}
      />
      <Text style={styles.hint}>
        IP del Proxmox y puerto del GL Server (por defecto 4000). Ej.: http://192.168.31.50:4000
      </Text>

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.secondary]} onPress={test} disabled={testing}>
          <Text style={styles.secondaryText}>{testing ? 'Probando…' : 'Probar conexión'}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primary]} onPress={save}>
          <Text style={styles.primaryText}>Guardar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  label: { color: palette.text, fontSize: 15, fontWeight: '600' },
  input: {
    backgroundColor: palette.surface,
    color: palette.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    fontSize: 16,
  },
  hint: { color: palette.textDim, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primary: { backgroundColor: palette.accent },
  primaryText: { color: '#04121F', fontWeight: '700' },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  secondaryText: { color: palette.text, fontWeight: '600' },
});
