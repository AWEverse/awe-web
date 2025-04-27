export type ReturnTypeMap = {
  is: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  getIs: () => boolean;
};

export type ActionKeys = keyof ReturnTypeMap;

export type SliceStateInterface<
  N extends string,
  Map extends Record<string, any> = ReturnTypeMap,
> = {
    [K in `${ActionKeys & string}${N}`]: K extends `${infer Action extends ActionKeys}${N}`
    ? Map[Action]
    : never;
  };

export type SliceStateFactory<
  Names extends readonly string[],
  Map extends Record<string, any> = ReturnTypeMap,
> = UnionToIntersection<SliceStateInterface<Names[number], Map>>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
