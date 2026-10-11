import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme';

/** Muestra un pop up de confirmación antes de borrar. */
export function confirmDelete(message: string, onConfirm: () => void) {
  Alert.alert('Borrar', message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Borrar', style: 'destructive', onPress: onConfirm },
  ]);
}

export function showError(error: unknown) {
  Alert.alert('Error', error instanceof Error ? error.message : 'Algo ha fallado');
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={palette.accent} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>No se pudo cargar</Text>
      <Text style={styles.dim}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.dim}>{message}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function Row({
  title,
  subtitle,
  onPress,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  onDelete?: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onDelete ? (
        <Pressable hitSlop={12} style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </Pressable>
      ) : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  dim: {
    color: palette.textDim,
    textAlign: 'center',
  },
  errorTitle: {
    color: palette.danger,
    fontSize: 17,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    backgroundColor: palette.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#04121F',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  rowPressed: {
    backgroundColor: palette.surfaceAlt,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: palette.textDim,
    fontSize: 13,
  },
  chevron: {
    color: palette.textDim,
    fontSize: 22,
    marginLeft: 8,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  deleteIcon: {
    fontSize: 17,
  },
});
