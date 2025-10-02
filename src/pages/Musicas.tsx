import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchSearch, fetchTop10ByArtist } from '../features/music/musicSlice';
import { addTrackToPlaylist } from '../features/playlists/playlistsSlice';
import type { Track } from '../utils/types';

const DEFAULT_ARTIST = (import.meta.env.VITE_DEFAULT_ARTIST as string) || 'Coldplay';

export default function Musicas() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { results, loading, error } = useAppSelector((s) => s.music);
  const allPlaylists = useAppSelector((s) => s.playlists.items);
  const minhas = useMemo(
    () => allPlaylists.filter((p) => p.usuarioId === user?.id),
    [allPlaylists, user?.id]
  );

  // filtros
  const [term, setTerm] = useState('');
  const [artist, setArtist] = useState('');
  const [artistError, setArtistError] = useState(false);

  // modal controlado
  const [showModal, setShowModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [addOkMsg, setAddOkMsg] = useState<string | null>(null);

  // rótulo dos resultados
  const [resultLabel, setResultLabel] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTop10ByArtist(DEFAULT_ARTIST));
    setResultLabel(`Top 3 — ${DEFAULT_ARTIST}`);
  }, [dispatch]);

  const openAddModal = (track: Track) => {
    setSelectedTrack(track);
    setSelectedPlaylistId(minhas[0]?.id ?? null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    // não limpamos selectedTrack pra permitir reabrir e confirmar se quiser
  };

  const confirmAdd = () => {
    if (!user || !selectedTrack || !selectedPlaylistId) return;
    dispatch(
      addTrackToPlaylist({
        id: selectedPlaylistId,
        usuarioId: user.id,
        track: selectedTrack,
      })
    );
    setAddOkMsg(`“${selectedTrack.nome}” adicionada com sucesso!`);
    setTimeout(() => setAddOkMsg(null), 2500);
    setShowModal(false);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const a = artist.trim();
    const q = term.trim();

    if (!a) {
      setArtistError(true);
      return;
    }
    setArtistError(false);

    if (!q) {
      dispatch(fetchTop10ByArtist(a));
      setResultLabel(`Top 10 — ${a}`);
    } else {
      dispatch(fetchSearch({ term: q, artist: a }));
      setResultLabel(`Resultados para “${q}” em ${a}`);
    }
  };

  const isSearchDisabled = !artist.trim() || loading;

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* esquerda */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">🔍 Buscar Músicas</h5>

              <form className="row g-2 align-items-start mb-3" onSubmit={onSearch} noValidate>
                <div className="col-sm-5">
                  <input
                    className="form-control"
                    placeholder="Nome da música (opcional)"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />
                </div>
                <div className="col-sm-5">
                  <input
                    className={`form-control ${artistError ? 'is-invalid' : ''}`}
                    placeholder="Artista (obrigatório)"
                    value={artist}
                    onChange={(e) => {
                      setArtist(e.target.value);
                      if (artistError) setArtistError(false);
                    }}
                    required
                  />
                  {artistError && (
                    <div className="invalid-feedback">Informe um artista para realizar a busca.</div>
                  )}
                </div>
                <div className="col-sm-2 d-grid">
                  <button className="btn btn-primary" type="submit" disabled={isSearchDisabled}>
                    {loading ? 'Buscando…' : 'Buscar'}
                  </button>
                </div>
              </form>

              {!!error && (
                <div className="alert alert-warning">
                  {error.includes('404')
                    ? 'Não foi possível carregar esse recurso agora. Tente outro artista/termo.'
                    : error}
                </div>
              )}

              {resultLabel && (
                <div className="badge text-bg-light text-secondary mb-2" style={{ fontWeight: 500 }}>
                  {resultLabel}
                </div>
              )}

              {addOkMsg && <div className="alert alert-success py-2">{addOkMsg}</div>}

              <div className="list-group">
                {results.length === 0 && !loading && (
                  <div className="text-muted text-center py-5">
                    Nenhum resultado no momento. Dica: artista é obrigatório; o nome da música é opcional.
                  </div>
                )}

                {results.map((m) => (
                  <div key={m.id} className="list-group-item d-flex align-items-center">
                    <div className="me-auto">
                      <div className="fw-semibold">{m.nome}</div>
                      <small className="text-muted">
                        {m.artista} {m.album ? `• ${m.album}` : ''} {m.ano ? `• ${m.ano}` : ''}
                      </small>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openAddModal(m)}
                      title="Adicionar à playlist"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* direita */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">📚 Minhas Playlists</h5>
              {minhas.length === 0 ? (
                <div className="text-muted">
                  Você ainda não tem playlists. Crie uma em <strong>Playlists</strong>.
                </div>
              ) : (
                <ul className="list-group">
                  {minhas.map((p) => (
                    <li key={p.id} className="list-group-item d-flex align-items-center">
                      <div className="me-auto">
                        <div className="fw-semibold">{p.nome}</div>
                        <small className="text-muted">{p.musicas.length} música(s)</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CONTROLADO */}
      {showModal && (
        <>
          {/* backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={closeModal}
          />
          {/* modal */}
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1055 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Adicionar à playlist</h5>
                  <button type="button" className="btn-close" onClick={closeModal} aria-label="Fechar" />
                </div>
                <div className="modal-body">
                  {minhas.length === 0 ? (
                    <div className="alert alert-info mb-0">
                      Crie uma playlist primeiro na página <strong>Playlists</strong>.
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <div className="fw-semibold">{selectedTrack?.nome}</div>
                        <small className="text-muted">
                          {selectedTrack?.artista}
                          {selectedTrack?.album ? ` • ${selectedTrack?.album}` : ''}
                        </small>
                      </div>
                      <select
                        className="form-select"
                        value={selectedPlaylistId ?? ''}
                        onChange={(e) => setSelectedPlaylistId(e.target.value)}
                      >
                        {minhas.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={confirmAdd}
                    disabled={!selectedPlaylistId || !selectedTrack}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
