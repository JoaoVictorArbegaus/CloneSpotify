export function isValidEmail(email: string) {
  // simples e suficiente para a avaliação
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(pwd: string) {
  return (pwd ?? '').length >= 6;
}
