import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import type { Song } from '@/api/types';
import { confirmDelete, EmptyView, ErrorView, Loading, Row, showError } from '@/components/ui';
import { useApiData } from '@/hooks/useApiData';

export default function CollectionScreen() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const id = params.id ?? '';
  const router = useRouter();
  const { data, error, loading, reload } = useApiData<Song[]>(() => api.songs(id), [id]);

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: params.name ?? 'Temas' }} />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyView message="Este grupo no tiene temas todavía." />}
          renderItem={({ item }) => (
            <Row
              title={item.name}
              onDelete={() =>
                confirmDelete(`¿Borrar el tema "${item.name}" y todos sus clips?`, async () => {
                  try {
                    await api.deleteSong(item.id);
                    reload();
                  } catch (error) {
                    showError(error);
                  }
                })
              }
              onPress={() =>
                router.push({ pathname: '/song/[id]', params: { id: item.id, name: item.name } })
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
  list: { padding: 16 },
});
