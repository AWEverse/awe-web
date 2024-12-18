// Function that mimics `!!` behavior
export function toBoolean(value: Falsy): boolean {
  return Boolean(value) && !!value;
}
