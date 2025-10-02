import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../app/store';
import { loginSuccess } from '../features/auth/authSlice';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { setSession } from '../utils/storage';
import { USERS, findUserByCredentials } from '../data/users';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!isValidPassword(senha)) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setBusy(true);
    try {
      const auth = findUserByCredentials(email, senha);
      if (!auth) {
        setError('E-mail ou senha inválidos.');
        return;
      }

      const user = { id: auth.id, email: auth.email, name: auth.name };
      dispatch(loginSuccess(user));
      setSession('session.lastLoginAt', Date.now());

      const redirectTo = location?.state?.from?.pathname ?? '/home';
      navigate(redirectTo, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card auth-card shadow-lg">
      <div className="card-body p-4 p-md-5">
        <h1 className="h3 mb-4 brand-gradient text-center">Login</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
          <div className="form-text mt-4">
            <div className="mb-1">Usuários de teste:</div>
            <ul className="mb-0">
              {USERS.map((u) => (
                <li key={u.id}>
                  <code>{u.email}</code> / <code>{u.password}</code>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
