import { useSettings } from '@/store/settings';
import type { Clip, Collection, CollectionTree, Song } from './types';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function baseUrl(): string {
  return useSettings.getState().serverUrl.trim().replace(/\/+$/, '');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = baseUrl();
  if (!base) throw new ApiError(0, 'Configura la URL del servidor en Ajustes.');

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  }

  if (!response.ok) throw new ApiError(response.status, `Error HTTP ${response.status}`);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  tree: () => request<CollectionTree[]>('/tree'),
  collections: () => request<Collection[]>('/collections'),
  songs: (collectionId: string) => request<Song[]>(`/collections/${collectionId}/songs`),
  clips: (songId: string) => request<Clip[]>(`/songs/${songId}/clips`),
  clip: (clipId: string) => request<Clip>(`/clips/${clipId}`),
};

export function streamUrl(clipId: string): string {
  return `${baseUrl()}/clips/${clipId}/stream`;
}
