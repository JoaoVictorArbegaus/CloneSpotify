import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '../../utils/types';
import { getMostLoved, getTop10ByArtist, searchTracks, searchTrackByArtistAndName } from './service/theaudiodb';

type Query = { artista?: string; genero?: string; ano?: string | number; nome?: string };

type MusicState = {
  query: Query;
  results: Track[];
  top10: Track[];
  loading: boolean;
  error?: string;
};

const initialState: MusicState = {
  query: {},
  results: [],
  top10: [],
  loading: false,
};

// === THUNKS ===
export const fetchTop10ByArtist = createAsyncThunk<Track[], string>(
  'music/fetchTop10ByArtist',
  async (artist) => {
    if (!artist?.trim()) return [];

    // 1) tenta pegar o Top 10 do artista
    const base = await getTop10ByArtist(artist.trim());

    // 2) se vierem menos de 10, completa com "most loved" (evitando duplicados)
    if (base.length < 10) {
      const loved = await getMostLoved();
      const seen = new Set(base.map(t => t.id));
      for (const t of loved) {
        if (!seen.has(t.id)) {
          base.push(t);
          seen.add(t.id);
          if (base.length === 10) break;
        }
      }
    }

    // 3) garante no máximo 10
    return base.slice(0, 10);
  }
);

export const fetchMostLoved = createAsyncThunk<Track[]>(
  'music/fetchMostLoved',
  async () => await getMostLoved()
);

export const fetchSearch = createAsyncThunk<Track[], { term: string; artist?: string }>(
  'music/fetchSearch',
  async ({ term, artist }) => {
    if (artist && term) {
      return await searchTrackByArtistAndName(artist, term);
    }
    return await searchTracks(term);
  }
);

// === SLICE ===
const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<Query>) {
      state.query = action.payload;
    },
    clearResults(state) {
      state.results = [];
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
  // Top10
  builder.addCase(fetchTop10ByArtist.pending, (s) => {
    s.loading = true;
    s.error = undefined;
  });
  builder.addCase(fetchTop10ByArtist.fulfilled, (s, a) => {
    s.loading = false;
    s.top10 = a.payload;
    s.results = a.payload;          // 👈 ADICIONE ESTA LINHA
  });
  builder.addCase(fetchTop10ByArtist.rejected, (s, a) => {
    s.loading = false;
    s.error = a.error.message;
  });

  // Most loved (se ainda usar)
  builder.addCase(fetchMostLoved.pending, (s) => { s.loading = true; s.error = undefined; });
  builder.addCase(fetchMostLoved.fulfilled, (s, a) => { s.loading = false; s.results = a.payload; });
  builder.addCase(fetchMostLoved.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });

  // Search
  builder.addCase(fetchSearch.pending, (s) => { s.loading = true; s.error = undefined; });
  builder.addCase(fetchSearch.fulfilled, (s, a) => { s.loading = false; s.results = a.payload; });
  builder.addCase(fetchSearch.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
}
});

export const { setQuery, clearResults } = musicSlice.actions;
export default musicSlice.reducer;
