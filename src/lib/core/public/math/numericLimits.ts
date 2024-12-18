// Numeric constants
export const MIN_UINT8: number = 0x00;
export const MAX_UINT8: number = 0xff;
export const MIN_UINT16: number = 0x0000;
export const MAX_UINT16: number = 0xffff;

export const MIN_UINT32: number = 0x00000000;
export const MAX_UINT32: number = 0xffffffff;
export const MIN_UINT64: bigint = 0x0000000000000000n;
export const MAX_UINT64: bigint = 0xffffffffffffffffn;

export const MIN_INT8: number = -128;
export const MAX_INT8: number = 0x7f;
export const MIN_INT16: number = -32768;
export const MAX_INT16: number = 0x7fff;

export const MIN_INT32: number = 0x80000000;
export const MAX_INT32: number = 0x7fffffff;
export const MIN_INT64: bigint = 0x8000000000000000n;
export const MAX_INT64: bigint = 0x7fffffffffffffffn;

export const MIN_FLT: number = 1.175494351e-38; // min positive value
export const MAX_FLT: number = 3.402823466e38;
export const MIN_DBL: number = 2.2250738585072014e-308; // min positive value
export const MAX_DBL: number = 1.7976931348623158e308;

// TypeScript numeric limits using a generic base class

export interface NumericLimits<T> {
  min: T;
  max: T;
  lowest?: T;
}

class NumericLimitsBase<T> implements NumericLimits<T> {
  constructor(
    public min: T,
    public max: T,
    public lowest?: T,
  ) {}
}

export const NumericLimitsUint8 = new NumericLimitsBase<number>(MIN_UINT8, MAX_UINT8);
export const NumericLimitsUint16 = new NumericLimitsBase<number>(MIN_UINT16, MAX_UINT16);
export const NumericLimitsUint32 = new NumericLimitsBase<number>(MIN_UINT32, MAX_UINT32);
export const NumericLimitsUint64 = new NumericLimitsBase<bigint>(MIN_UINT64, MAX_UINT64);
export const NumericLimitsInt8 = new NumericLimitsBase<number>(MIN_INT8, MAX_INT8);
export const NumericLimitsInt16 = new NumericLimitsBase<number>(MIN_INT16, MAX_INT16);
export const NumericLimitsInt32 = new NumericLimitsBase<number>(MIN_INT32, MAX_INT32);
export const NumericLimitsInt64 = new NumericLimitsBase<bigint>(MIN_INT64, MAX_INT64);
export const NumericLimitsFloat = new NumericLimitsBase<number>(MIN_FLT, MAX_FLT, -MAX_FLT);
export const NumericLimitsDouble = new NumericLimitsBase<number>(MIN_DBL, MAX_DBL, -MAX_DBL);
