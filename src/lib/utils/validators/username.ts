export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 32;
export const USERNAME_REGEX = /^[a-zA-Z]\w*$/;

export function isUsernameValid(username: string, isUpdating?: boolean): boolean {
  const effectiveMinLength = isUpdating ? 5 : MIN_USERNAME_LENGTH;

  if (username.length < effectiveMinLength || username.length > MAX_USERNAME_LENGTH) {
    return false;
  }

  return USERNAME_REGEX.test(username);
}
