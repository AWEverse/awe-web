export const ESupportLevel = {
  SUPPORTED: {
    FULL: Symbol("FULL"),
    PARTIAL: Symbol("PARTIAL"),
    EXPERIMENTAL: Symbol("EXPERIMENTAL"),
  },
  DEPRECATED: Symbol("DEPRECATED"),
  UNSUPPORTED: Symbol("UNSUPPORTED"),
  UNKNOWN: Symbol("UNKNOWN"),
} as const;

export type SupportLevelType =
  (typeof ESupportLevel)[keyof typeof ESupportLevel];
