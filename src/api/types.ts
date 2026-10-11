export interface Collection {
  id: string;
  name: string;
  created_at: number;
}

export interface Song {
  id: string;
  collection_id: string;
  name: string;
  created_at: number;
}

export interface Clip {
  id: string;
  song_id: string;
  name: string;
  filename: string;
  duration: number;
  suggested_speed: number | null;
  position: number;
  created_at: number;
}

export interface SongWithClips extends Song {
  clips: Clip[];
}

export interface CollectionTree extends Collection {
  songs: SongWithClips[];
}
