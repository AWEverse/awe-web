const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
