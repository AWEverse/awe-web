/**
 * Generates a random 24-bit integer (0 to 16777215) and converts it to a 6-digit hex string.
 * Uses bitwise operations for efficiency.
 * @returns A 6-digit hex string (e.g., "1a2b3c").
 */
const randomHex = (): string => {
  // Generate random 24-bit integer: (Math.random() * 16777216) | 0
  // 16777216 = 2^24, | 0 truncates to integer (replaces Math.floor)
  const rand = (Math.random() * 0x1000000) | 0;
  // Convert to hex, pad with zeros to ensure 6 digits
  return rand.toString(16).padStart(6, "0");
};

/**
 * Generates a random HEX color (e.g., #1a2b3c).
 * @returns A HEX color string.
 */
export const randomColor = (): string => `#${randomHex()}`;

/**
 * Generates a random RGB color (e.g., rgb(123, 45, 67)).
 * @returns An RGB color string.
 */
export const randomColorRGB = (): string => {
  // Generate three 8-bit integers: (Math.random() * 256) | 0
  const r = (Math.random() * 0x100) | 0;
  const g = (Math.random() * 0x100) | 0;
  const b = (Math.random() * 0x100) | 0;
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Generates a random RGBA color with random alpha (e.g., rgba(123, 45, 67, 0.5)).
 * @returns An RGBA color string.
 */
export const randomColorRGBA = (): string => {
  const r = (Math.random() * 0x100) | 0;
  const g = (Math.random() * 0x100) | 0;
  const b = (Math.random() * 0x100) | 0;
  const a = Math.random(); // Alpha remains floating-point for CSS
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Generates a random HSL color with full saturation and medium lightness (e.g., hsl(180, 100%, 50%)).
 * @returns An HSL color string.
 */
export const randomColorHSL = (): string => {
  // Generate hue: (Math.random() * 360) | 0
  const h = (Math.random() * 0x168) | 0; // 0x168 = 360
  return `hsl(${h}, 100%, 50%)`;
};

/**
 * Generates a random HSLA color with random alpha (e.g., hsla(180, 100%, 50%, 0.5)).
 * @returns An HSLA color string.
 */
export const randomColorHSLA = (): string => {
  const h = (Math.random() * 0x168) | 0;
  const a = Math.random();
  return `hsla(${h}, 100%, 50%, ${a})`;
};

/**
 * Alias for randomColor (HEX color, e.g., #1a2b3c).
 * @returns A HEX color string.
 */
export const randomColorHEX = (): string => `#${randomHex()}`;

/**
 * Generates a random HEX color with 8 digits (6 for color, 2 for alpha, e.g., #1a2b3cff).
 * @returns An 8-digit HEX color string.
 */
export const randomColorHEXA = (): string => {
  const color = randomHex();
  // Generate 8-bit alpha: (Math.random() * 256) | 0
  const alpha = ((Math.random() * 0x100) | 0).toString(16).padStart(2, "0");
  return `#${color}${alpha}`;
};

/**
 * Generates a random HEX color with 12 digits (concatenating three hex values, e.g., #1a2b3c4d5e6f).
 * @returns A 12-digit HEX color string.
 */
export const randomColorHEXAA = (): string => `#${randomHex()}${randomHex()}${randomHex()}`;
