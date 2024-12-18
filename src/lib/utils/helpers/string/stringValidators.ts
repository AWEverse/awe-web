const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/g;

export function isNullOrEmpty(value: string | null | undefined): boolean {
  return !value || value.length === 0;
}

export function isNullOrWhiteSpace(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function isNullOrWhiteSpaceOrEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0 || value.length === 0;
}

export function hasSpecialCharacters(value?: string | null): boolean {
  if (!value?.trim()) return false;

  return specialCharRegex.test(value);
}
