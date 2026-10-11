import { Stack, useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '@/api/client';
import type { Collection } from '@/api/types';
import { confirmDelete, EmptyView, ErrorView, Loading, PrimaryButton, Row, showError } from '@/components/ui';
import { useApiData } from '@/hooks/useApiData';
import { useSettings } from '@/store/settings';
import { palette } from '@/theme';

export default function CollectionsScreen() {
  const router = useRouter();
  const serverUrl = useSettings((state) => state.serverUrl);
  const { data, error, loading, reload } = useApiData<Collection[]>(
    () => api.collections(),
    [serverUrl],
  );

  if (!serverUrl) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Sin servidor configurado</Text>
        <Text style={styles.dim}>Indica la dirección del GL Server para empezar.</Text>
        <PrimaryButton label="Abrir ajustes" onPress={() => router.push('/settings')} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable hitSlop={12} onPress={() => router.push('/settings')}>
              <Text style={styles.headerButton}>Ajustes</Text>
            </Pressable>
          ),
        }}
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyView message="Sin colecciones todavía. Envía clips desde el escritorio." />
          }
          renderItem={({ item }) => (
            <Row
              title={item.name}
              onDelete={() =>
                confirmDelete(`¿Borrar la colección "${item.name}" y todos sus clips?`, async () => {
                  try {
                    await api.deleteCollection(item.id);
                    reload();
                  } catch (error) {
                    showError(error);
                  }
                })
              }
              onPress={() =>
                router.push({ pathname: '/collection/[id]', params: { id: item.id, name: item.name } })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: { color: palette.text, fontSize: 18, fontWeight: '700' },
  dim: { color: palette.textDim, textAlign: 'center' },
  list: { padding: 16 },
  headerButton: { color: palette.accent, fontSize: 16 },
});
