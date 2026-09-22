export function validatePassword(password: string) {
  if (!password || password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres."
  }
  return null
}
