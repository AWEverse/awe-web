export const UINT8 = { MIN: 0x00, MAX: 0xff };
export const INT8 = { MIN: -128, MAX: 0x7f };

export const UINT16 = { MIN: 0x0000, MAX: 0xffff };
export const INT16 = { MIN: -32768, MAX: 0x7fff };

export const UINT32 = { MIN: 0x00000000, MAX: 0xffffffff };
export const INT32 = { MIN: -2147483648, MAX: 0x7fffffff };

export const UINT64 = { MIN: 0n, MAX: 0xffffffffffffffffn };
export const INT64 = { MIN: -0x8000000000000000n, MAX: 0x7fffffffffffffffn };

export const FLT = {
  MIN: 1.175494351e-38,
  MAX: 3.402823466e38,
};

export const DBL = {
  MIN: 2.2250738585072014e-308,
  MAX: Number.MAX_VALUE,
};

export interface NumericLimits<T = number> {
  min: T;
  max: T;
  lowest?: T;
}

export type NumericLimitsType =
  | "uint8"
  | "uint16"
  | "uint32"
  | "uint64"
  | "int8"
  | "int16"
  | "int32"
  | "int64"
  | "float"
  | "double";
