import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import {
  createPlaylist,
  deletePlaylist,
  updatePlaylistName,
} from '../features/playlists/playlistsSlice';

export default function Playlists() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const all = useAppSelector((s) => s.playlists.items);

  const minhas = useMemo(
    () => all.filter((p) => p.usuarioId === user?.id),
    [all, user?.id]
  );

  const [nome, setNome] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');

  if (!user) return null; // guard adicional

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    dispatch(createPlaylist(nome, user.id));
    setNome('');
  };

  const handleStartEdit = (id: string, current: string) => {
    setEditId(id);
    setEditNome(current);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editNome.trim()) return;
    dispatch(updatePlaylistName({ id: editId, usuarioId: user.id, nome: editNome }));
    setEditId(null);
    setEditNome('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta playlist?')) {
      dispatch(deletePlaylist({ id, usuarioId: user.id }));
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-3">Playlists</h1>

      {/* Criar nova */}
      <form className="row g-2 mb-4" onSubmit={handleCreate}>
        <div className="col-sm-8 col-md-6">
          <input
            className="form-control"
            placeholder="Nome da playlist"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit">Criar</button>
        </div>
      </form>

      {/* Lista */}
      {minhas.length === 0 ? (
        <div className="alert alert-info">Você ainda não tem playlists.</div>
      ) : (
        <div className="list-group">
          {minhas.map((p) => (
            <div key={p.id} className="list-group-item d-flex align-items-center">
              {editId === p.id ? (
                <form className="d-flex align-items-center w-100 gap-2" onSubmit={handleSaveEdit}>
                  <input
                    className="form-control"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    autoFocus
                  />
                  <button className="btn btn-success btn-sm" type="submit">Salvar</button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    onClick={() => { setEditId(null); setEditNome(''); }}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <div className="me-auto">
                    <div className="fw-semibold">{p.nome}</div>
                    <small className="text-muted">{p.musicas.length} música(s)</small>
                  </div>

                  <div className="btn-group">
                    <Link to={`/playlists/${p.id}`} className="btn btn-outline-primary btn-sm">
                      Abrir
                    </Link>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleStartEdit(p.id, p.nome)}
                    >
                      Renomear
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
