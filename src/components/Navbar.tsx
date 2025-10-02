import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3 shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-gradient" to="/home">
          🎵 Clonefy
        </Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/home">Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/musicas">Músicas</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/playlists">Playlists</NavLink>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {!user ? (
              // só mostra o botão se NÃO estiver na página de login
              location.pathname !== '/login' && (
                <li className="nav-item">
                  <NavLink className="btn btn-outline-light btn-sm" to="/login">
                    Login
                  </NavLink>
                </li>
              )
            ) : (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">{user.email}</span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
