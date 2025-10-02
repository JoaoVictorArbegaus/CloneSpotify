// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Musicas from '../pages/Musicas';
import Playlists from '../pages/Playlists';
import PlaylistDetalhe from '../pages/PlaylistDetalhe';
import AuthGuard from '../features/auth/AuthGuard';

export default function AppRouter() {
  return (
    <Routes>
      {/* Layout principal com Navbar/Footer + <Outlet /> */}
      <Route element={<App />}>
        {/* redireciona / para /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* rota pública */}
        <Route path="/login" element={
          <div className="d-flex align-items-center justify-content-center min-vh-100">
            <Login />
          </div>
        } />

        {/* rotas protegidas */}
        <Route element={<AuthGuard />}>
          <Route path="/home" element={<Home />} />
          <Route path="/musicas" element={<Musicas />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetalhe />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
