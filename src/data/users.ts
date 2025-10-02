// Você pode ajustar/expandir essa lista à vontade.
// Em produção não se guarda senha em texto plano — aqui é só para a avaliação.

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  password: string;   // mock
  role?: 'admin' | 'user';
};

export const USERS: AuthUser[] = [
  { id: 'u-1', email: 'joao@teste.com',  name: 'Joao', password: '123456', role: 'user' },
  { id: 'u-2', email: 'victor@teste.com', name: 'Victor', password: '123456', role: 'user' },
  // adicione mais se quiser
];

export function findUserByCredentials(email: string, password: string): AuthUser | null {
  const norm = email.trim().toLowerCase();
  return USERS.find(u => u.email.toLowerCase() === norm && u.password === password) ?? null;
}
