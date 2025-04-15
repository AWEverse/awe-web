const CHAR_A = 65;
const CHAR_Z = 90;
const CHAR_a = 97;
const CHAR_z = 122;
const CHAR_0 = 48;
const CHAR_9 = 57;
const CHAR_DOLLAR = 36;
const CHAR_UNDERSCORE = 95;
const CHAR_COLON = 58;

/**
 * Validates if a segment is a valid identifier (JS identifier or number string).
 * Uses character code checks for minimal resource usage.
 * @param seg - The segment to validate.
 * @returns True if the segment is valid, false otherwise.
 */
export function isValidIdentifier(seg: string): boolean {
  if (!seg) return false;

  const len = seg.length;
  let i = 0;

  // Check if it's a number string
  if (seg[0] >= "0" && seg[0] <= "9") {
    while (i < len) {
      const c = seg.charCodeAt(i++);
      if (c < CHAR_0 || c > CHAR_9) return false; // Not 0-9
    }
    return true;
  }

  // Check first character: letter, underscore, or dollar
  const first = seg.charCodeAt(0);
  if (
    !((first >= CHAR_A && first <= CHAR_Z) || // A-Z
      (first >= CHAR_a && first <= CHAR_z) || // a-z
      first === CHAR_DOLLAR || first === CHAR_UNDERSCORE)
  ) {
    return false;
  }

  // Check remaining: letter, digit, underscore, or dollar
  for (i = 1; i < len; i++) {
    const c = seg.charCodeAt(i);
    if (
      !((c >= CHAR_A && c <= CHAR_Z) || // A-Z
        (c >= CHAR_a && c <= CHAR_z) || // a-z
        (c >= CHAR_0 && c <= CHAR_9) || // 0-9
        c === CHAR_DOLLAR || c === CHAR_UNDERSCORE)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Validates if a segment is a named parameter (e.g., ":param").
 * Uses character code checks for minimal resource usage.
 * @param seg - The segment to check.
 * @returns True if the segment is a named parameter, false otherwise.
 */
export function isTemplate(seg: string): boolean {
  if (seg.length < 2 || seg.charCodeAt(0) !== CHAR_COLON) return false;

  // Check first character after ':': letter, underscore, or dollar
  const first = seg.charCodeAt(1);
  if (
    !((first >= CHAR_A && first <= CHAR_Z) || // A-Z
      (first >= CHAR_a && first <= CHAR_z) || // a-z
      first === CHAR_DOLLAR || first === CHAR_UNDERSCORE)
  ) {
    return false;
  }

  // Check remaining: letter, digit, underscore, or dollar
  for (let i = 2; i < seg.length; i++) {
    const c = seg.charCodeAt(i);
    if (
      !((c >= CHAR_A && c <= CHAR_Z) || // A-Z
        (c >= CHAR_a && c <= CHAR_z) || // a-z
        (c >= CHAR_0 && c <= CHAR_9) || // 0-9
        c === CHAR_DOLLAR || c === CHAR_UNDERSCORE)
    ) {
      return false;
    }
  }

  return true;
}
