import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';

import {
  deletePlaylist,
  updatePlaylistName,
  removeTrackFromPlaylist,
} from '../features/playlists/playlistsSlice';

import { setSession } from '../utils/storage';

export default function PlaylistDetalhe() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const playlist = useAppSelector((s) => s.playlists.items.find((p) => p.id === id));

  const souDono = useMemo(
    () => !!(user && playlist && playlist.usuarioId === user.id),
    [user?.id, playlist?.usuarioId]
  );

  const [nome, setNome] = useState(playlist?.nome ?? '');

  // Salva última playlist acessada na sessão
  useEffect(() => {
    if (playlist) setSession('session.lastPlaylistId', playlist.id);
  }, [playlist?.id]);

  // Mantém input sincronizado quando o nome mudar
  useEffect(() => {
    if (playlist?.nome != null) setNome(playlist.nome);
  }, [playlist?.nome]);

  // Guard: playlist inexistente → voltar
  useEffect(() => {
    if (user && id && !playlist) {
      alert('Playlist não encontrada.');
      navigate('/playlists', { replace: true });
    }
  }, [user?.id, id, !!playlist, navigate]);

  // Guard: acesso apenas do dono
  useEffect(() => {
    if (playlist && user && playlist.usuarioId !== user.id) {
      alert('Você não tem permissão para acessar esta playlist.');
      navigate('/playlists', { replace: true });
    }
  }, [playlist?.usuarioId, user?.id, navigate]);

  if (!playlist || !souDono) return null; // já redirecionamos acima

  const handleSalvarNome = (e: React.FormEvent) => {
    e.preventDefault();
    const novo = nome.trim();
    if (!novo || !user || novo === playlist.nome) return;
    dispatch(updatePlaylistName({ id, usuarioId: user.id, nome: novo }));
  };

  const handleExcluir = () => {
    if (!user) return;
    if (confirm('Tem certeza que deseja excluir esta playlist?')) {
      dispatch(deletePlaylist({ id, usuarioId: user.id }));
      navigate('/playlists', { replace: true });
    }
  };

  const mudouNome = nome.trim() !== (playlist.nome ?? '');

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3 gap-2">
        <Link to="/playlists" className="btn btn-outline-secondary btn-sm">← Voltar</Link>
        <h1 className="me-auto mb-0">{playlist.nome}</h1>
        <button className="btn btn-outline-danger" onClick={handleExcluir}>
          Excluir
        </button>
      </div>

      <form className="row g-2 mb-4" onSubmit={handleSalvarNome}>
        <div className="col-sm-6 col-md-4">
          <input
            className="form-control"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-success" type="submit" disabled={!mudouNome || !nome.trim()}>
            Salvar nome
          </button>
        </div>
      </form>

      <h5 className="mb-3">Músicas ({playlist.musicas.length})</h5>
      {playlist.musicas.length === 0 ? (
        <div className="alert alert-info">
          Nenhuma música ainda. Vá em <strong>Músicas</strong> e adicione à playlist.
        </div>
      ) : (
        <ul className="list-group">
          {playlist.musicas.map((m) => (
            <li key={m.id} className="list-group-item d-flex align-items-center">
              <div className="me-auto">
                <div className="fw-semibold">{m.nome}</div>
                <small className="text-muted">
                  {m.artista} {m.album ? `• ${m.album}` : ''} {m.ano ? `• ${m.ano}` : ''}
                </small>
              </div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() =>
                  user &&
                  dispatch(
                    removeTrackFromPlaylist({ id, usuarioId: user.id, trackId: m.id })
                  )
                }
                title="Remover da playlist"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
