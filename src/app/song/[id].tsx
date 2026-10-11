import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { api } from '@/api/client';
import type { Clip } from '@/api/types';
import { confirmDelete, EmptyView, ErrorView, Loading, Row, showError } from '@/components/ui';
import { useApiData } from '@/hooks/useApiData';

export default function SongScreen() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const id = params.id ?? '';
  const router = useRouter();
  const { data, error, loading, reload } = useApiData<Clip[]>(() => api.clips(id), [id]);

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: params.name ?? 'Clips' }} />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyView message="Este tema no tiene clips todavía." />}
          renderItem={({ item }) => (
            <Row
              title={item.name}
              subtitle={item.suggested_speed ? `${item.suggested_speed}x sugerido` : undefined}
              onDelete={() =>
                confirmDelete(`¿Borrar el clip "${item.name}"?`, async () => {
                  try {
                    await api.deleteClip(item.id);
                    reload();
                  } catch (error) {
                    showError(error);
                  }
                })
              }
              onPress={() =>
                router.push({
                  pathname: '/player/[id]',
                  params: { id: item.id, song: id, name: item.name },
                })
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
