// Helpers simples para LocalStorage e sessionStorage com parse seguro

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// ----- LocalStorage -----
export function getLocal<T>(key: string): T | null {
  return safeParse<T>(localStorage.getItem(key));
}
export function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function removeLocal(key: string) {
  localStorage.removeItem(key);
}

// ----- sessionStorage -----
export function getSession<T>(key: string): T | null {
  return safeParse<T>(sessionStorage.getItem(key));
}
export function setSession<T>(key: string, value: T) {
  sessionStorage.setItem(key, JSON.stringify(value));
}
export function removeSession(key: string) {
  sessionStorage.removeItem(key);
}
