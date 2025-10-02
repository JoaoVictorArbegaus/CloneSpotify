import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Playlist, Track } from '../../utils/types';
import { getLocal, setLocal } from '../../utils/storage';

const LS_KEY = 'app.playlists';

type PlaylistsState = {
  items: Playlist[];
};

const initialState: PlaylistsState = {
  items: getLocal<Playlist[]>(LS_KEY) ?? [],
};

function persist(items: Playlist[]) {
  setLocal(LS_KEY, items);
}

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    hydrateFromLocal(state) {
      state.items = getLocal<Playlist[]>(LS_KEY) ?? [];
    },

    // CRUD básico
    createPlaylist: {
      prepare(nome: string, usuarioId: string) {
        const now = Date.now();
        return {
          payload: {
            id: crypto.randomUUID(),
            nome: nome.trim(),
            usuarioId,
            musicas: [] as Track[],
            createdAt: now,
            updatedAt: now,
          } as Playlist,
        };
      },
      reducer(state, action: PayloadAction<Playlist>) {
        state.items.unshift(action.payload);
        persist(state.items);
      },
    },

    // dentro de createSlice({ ..., reducers: { ... } })
    addTrackToPlaylist(
      state,
      action: PayloadAction<{ id: string; usuarioId: string; track: Track }>
    ) {
      const { id, usuarioId, track } = action.payload;
      const p = state.items.find(pl => pl.id === id);
      if (!p || p.usuarioId !== usuarioId) return; // bloqueia se não for dono
      if (!p.musicas.some(m => m.id === track.id)) {
        p.musicas.push(track);
        persist(state.items);
      }
    },

    removeTrackFromPlaylist(
      state,
      action: PayloadAction<{ id: string; usuarioId: string; trackId: string }>
    ) {
      const { id, usuarioId, trackId } = action.payload;
      const p = state.items.find(pl => pl.id === id);
      if (!p || p.usuarioId !== usuarioId) return; // bloqueia se não for dono
      p.musicas = p.musicas.filter(m => m.id !== trackId);
      persist(state.items);
    },

    updatePlaylistName(
      state,
      action: PayloadAction<{ id: string; usuarioId: string; nome: string }>
    ) {
      const { id, usuarioId, nome } = action.payload;
      const p = state.items.find(pl => pl.id === id);
      if (!p || p.usuarioId !== usuarioId) return; // bloqueia se não for dono
      p.nome = nome;
      persist(state.items);
    },

    deletePlaylist(
      state,
      action: PayloadAction<{ id: string; usuarioId: string }>
    ) {
      const { id, usuarioId } = action.payload;
      const p = state.items.find(pl => pl.id === id);
      if (!p || p.usuarioId !== usuarioId) return; // bloqueia se não for dono
      state.items = state.items.filter(pl => pl.id !== id);
      persist(state.items);
    },

  },
});

export const {
  hydrateFromLocal,
  createPlaylist,
  updatePlaylistName,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;
