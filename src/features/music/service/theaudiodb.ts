import axios, { AxiosError } from 'axios';
import type { Track } from '../../../utils/types';

const rawBase = (import.meta.env.VITE_AUDIODB_BASE as string) || 'https://www.theaudiodb.com/api/v1/json/2';
const BASE = rawBase.trim().replace(/\/+$/, ''); // remove barras finais

const api = axios.create({
  baseURL: `${BASE}/`,
  timeout: 12000,
});

// Util: se der 404, devolve null (para tratarmos como lista vazia)
async function safeGet<T = any>(url: string, params?: Record<string, any>): Promise<T | null> {
  try {
    const { data } = await api.get<T>(url, { params });
    return data;
  } catch (err) {
    const e = err as AxiosError;
    if (e.response?.status === 404) return null;
    throw err;
  }
}

function mapApiTrack(t: any): Track {
  return {
    id: String(t?.idTrack ?? t?.id ?? crypto.randomUUID()),
    nome: t?.strTrack ?? t?.trackName ?? '—',
    artista: t?.strArtist ?? t?.artistName ?? '—',
    genero: t?.strGenre ?? undefined,
    ano: t?.intYearReleased ?? t?.yearReleased ?? undefined,
    album: t?.strAlbum ?? t?.collectionName ?? undefined,
    thumbUrl: t?.strTrackThumb ?? undefined,
    previewUrl: t?.strMusicVid ?? undefined,
  };
}

export async function getTop10ByArtist(artist: string): Promise<Track[]> {
  const data = await safeGet<any>('track-top10.php', { s: artist });
  const list = data?.track ?? data?.tracks ?? [];
  return Array.isArray(list) ? list.map(mapApiTrack) : [];
}

export async function searchTracks(term: string): Promise<Track[]> {
  const q = term.trim();
  if (!q) return [];

  // 1) tentar por nome de faixa direto (t=<faixa>)
  const dataByTitle = await safeGet<any>('searchtrack.php', { t: q });
  const byTitle = Array.isArray(dataByTitle?.track) ? dataByTitle.track.map(mapApiTrack) : [];
  if (byTitle.length) return byTitle;

  // 2) fallback inteligente: procurar artistas com esse termo...
  //    e tentar s=<artista>&t=<faixa> para os 3 primeiros
  const artistsData = await safeGet<any>('search.php', { s: q });
  const artists = Array.isArray(artistsData?.artists) ? artistsData.artists : [];

  const MAX_ARTISTS = 3;
  const collected: Track[] = [];
  for (const a of artists.slice(0, MAX_ARTISTS)) {
    const artistName = a?.strArtist;
    if (!artistName) continue;

    const data = await safeGet<any>('searchtrack.php', { s: artistName, t: q });
    const list = Array.isArray(data?.track) ? data.track.map(mapApiTrack) : [];
    for (const t of list) {
      // evita duplicados por id
      if (!collected.some(c => c.id === t.id)) collected.push(t);
    }
  }

  if (collected.length) return collected;

  // 3) fallback final: tentar como "artista" (Top 10) — mantém seu caso "queen"
  const topAsArtist = await getTop10ByArtist(q);
  return topAsArtist;
}



export async function searchTrackByArtistAndName(artist: string, track: string): Promise<Track[]> {
  const data = await safeGet<any>('searchtrack.php', { s: artist, t: track });
  const list = data?.track ?? [];
  return Array.isArray(list) ? list.map(mapApiTrack) : [];
}

// Deixamos como util opcional; pode 404 dependendo do provedor
export async function getMostLoved(): Promise<Track[]> {
  // 1) tenta com a base configurada (geralmente .../json/2)
  const data2 = await safeGet<any>('mostloved.php', { format: 'track' });
  let list = Array.isArray(data2?.loved) ? data2.loved : Array.isArray(data2?.track) ? data2.track : [];

  // 2) se vazio, tenta explícito com a key 1
  if (!list.length) {
    try {
      const { data } = await axios.get('https://www.theaudiodb.com/api/v1/json/1/mostloved.php', {
        params: { format: 'track' },
        timeout: 12000,
      });
      list = Array.isArray(data?.loved) ? data.loved : Array.isArray(data?.track) ? data.track : [];
    } catch {
      // mantém vazio se também falhar
    }
  }

  return list.map(mapApiTrack);
}
