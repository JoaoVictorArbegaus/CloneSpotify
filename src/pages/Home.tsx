import { useEffect, useMemo, useState } from 'react';
import type { Track } from '../utils/types';
import { getTop10ByArtist } from '../features/music/service/theaudiodb';

const DEFAULT_HOME_ARTISTS = (import.meta.env.VITE_HOME_ARTISTS as string)
  || 'Coldplay,Queen,The Beatles,Adele';

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // normaliza a lista de artistas do .env
  const artists = useMemo(
    () => DEFAULT_HOME_ARTISTS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4),
    []
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(undefined);

      try {
        const perArtist = await Promise.all(
          artists.map((a) => getTop10ByArtist(a))
        );

        const interleaved: Track[] = [];
        const maxLen = Math.max(...perArtist.map(arr => arr.length));
        const seen = new Set<string>();

        for (let i = 0; i < maxLen && interleaved.length < 10; i++) {
          for (let k = 0; k < perArtist.length && interleaved.length < 10; k++) {
            const t = perArtist[k][i];
            if (!t) continue;
            if (seen.has(t.id)) continue;
            interleaved.push(t);
            seen.add(t.id);
          }
        }

        if (interleaved.length < 10) {
          for (const arr of perArtist) {
            for (const t of arr) {
              if (interleaved.length >= 10) break;
              if (seen.has(t.id)) continue;
              interleaved.push(t);
              seen.add(t.id);
            }
            if (interleaved.length >= 10) break;
          }
        }

        if (!cancelled) setTracks(interleaved.slice(0, 10));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Falha ao carregar o Top 10.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [artists]);

  return (
    <div className="container">
      <div className="glass p-3 p-md-4 shadow-sm fade-in">
        <h1 className="h3 mb-3 section-title">Top 10</h1>

        {error && <div className="alert alert-warning">{error}</div>}

        {loading ? (
          <div className="text-white-50">Carregando…</div>
        ) : tracks.length === 0 ? (
          <div className="text-white-50">Nada para exibir no momento.</div>
        ) : (
          <div className="list-group list-group-flush">
            {tracks.map((m) => (
              <div key={m.id} className="list-group-item bg-transparent px-0 border-0">
                <div className="d-flex align-items-center glass-item px-3 py-3">
                  <div className="me-auto">
                    <div className="fw-semibold">{m.nome}</div>
                    <small className="text-white-50">
                      {m.artista} {m.album ? `• ${m.album}` : ''} {m.ano ? `• ${m.ano}` : ''}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}
