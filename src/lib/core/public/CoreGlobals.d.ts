/* eslint-disable @typescript-eslint/no-explicit-any */
type Partial<T> = {
  [K in keyof T]?: T[K];
};

type Undefined<T> = {
  [K in keyof T]: undefined;
};

// Fix to make Boolean() work as !!
type Falsy = false | 0 | '' | null | undefined;

interface BooleanConstructor {
  new <T>(value: T | Falsy): value is T;
  <T>(value: T | Falsy): value is T;
  readonly prototype: boolean;
}

const Boolean: BooleanConstructor = (value: any) => !!value;

interface Array<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[];
}

interface ReadonlyArray<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[];
}

type OptionalCombine<A, B> = Intersection<A, B> | Intersection<A | Undefined<B>>;

type Union<A, B> = A & B;
type Intersection<A, B> = A extends B ? A : never;
type Difference<A, B> = A extends B ? never : A;
type SymmetricDifference<A, B> = Difference<A, B> | Difference<B, A>;
type Complement<A, B extends A> = Difference<B, A>;

type ElementType<T> = T extends ReadonlyArray<infer T> ? T : never;
type ElementsOfAll<T, R extends ReadonlyArray<unknown> = []> = T extends readonly [
  infer F,
  ...infer M,
]
  ? ElementsOfAll<M, [...R, ElementType<F>]>
  : R;

type CartesianProduct<T> = ElementsOfAll<T>[];

type PowerSet<T> = {
  [K in keyof T]?: T[K][];
};

type DeMorgansLaw1<A, B, C> = [
  Difference<A, Intersection<B, C>>,
  Difference<A, B>,
  Difference<A, C>,
];
type DeMorgansLaw2<A, B, C> = [
  Difference<A, Union<B, C>>,
  Intersection<A, Difference<B, C>>,
  Intersection<A, Difference<C, B>>,
];

type CommonProperties<T, U> = {
  [K in Union<keyof T, keyof U>]: Union<T[K], U[K]>;
};

type NoneToVoidFunction = () => void;
type NoneToUnknownFunction = () => unknown;
type NoneToAnyFunction = () => any;

type UnknownLiteral = Record<string, unknown>;
type UnknownClass = new (...args: unknown[]) => unknown;
type UnknownFunction = (...args: unknown[]) => unknown;
type UnknownToVoidFunction = (...args: unknown[]) => void;
type NoneToUnknownFunction = (...args: unknown[]) => unknown;

type AnyToFunctionalComponent = (props: any) => FC<any>;
type AnyLiteral = Record<string, any>;
type AnyClass = new (...args: any[]) => any;
type AnyFunction = (...args: any[]) => any;
type AnyToVoidFunction = (...args: any[]) => void;
type NoneToAnyFunction = () => any;

type AnyArray = any[];

type Nullable<T = null> = T | null;
type NonNullable<T> = T extends null | undefined ? never : T;

type IEmptySet = never;
type ISingletonSet<T> = { value: T };
type IUniversalSet = any;
type ITuple<T extends any[]> = [...T];
type IMultiset = { [key: string]: number };
type IMap<K, V> = Map<K, V>;
type ISet<T> = Set<T>;

// Пространство
// В данном случае оставим тип как any, так как структура пространства может быть разнообразной
type ISpace = any;
type IVector<T> = T[];
type IMatrix<T> = T[][];
type IArray<T> = T[];
type IArray2D<T> = T[][];
type ISequence<T> = T[];
type FuzzySet<T> = { element: T; membershipDegree: number }[];
type IInterval<T> = [T, T];

type Vertex = string | number;
type Edge<T extends Vertex = Vertex> = [T, T];
type AdjacencyList<T extends Vertex = Vertex> = Map<T, T[]>;

interface Graph<T extends Vertex = Vertex> {
  vertices: Set<T>;
  edges: Set<Edge<T>>;
  adjacencyList: AdjacencyList<T>;
}

interface Array<T> {
  aggregate<S>(seed: S, func: (acc: S, item: T) => S): S;
  all(predicate: (item: T) => boolean): boolean;
  any(predicate?: (item: T) => boolean): boolean;
  contains(item: T): boolean;
  countBy(selector?: (item: T) => number): number;
  distinct(): T[];
  except(secondArray: T[]): T[];
  first(predicate?: (item: T) => boolean): T | undefined;
  groupBy<K>(keySelector: (item: T) => K): Map<K, T[]>;
  intersect(secondArray: T[]): T[];
  joins<T, U, K, V>(
    innerArray: U[],
    outerKeySelector: (outer: T) => K,
    innerKeySelector: (inner: U) => K,
    resultSelector: (outer: T, inner: U) => V,
  ): V[];
  last(predicate?: (item: T) => boolean): T | undefined;
  orderBy(selector: (item: T) => any): T[];
  orderByDescending(selector: (item: T) => any): T[];
  select<S>(selector: (item: T) => S): S[];
  selectMany<U>(selector: (item: T) => U[]): U[];
  skip(count: number): T[];
  skipWhile(predicate: (item: T) => boolean): T[];
  sum(selector?: (item: T) => number): number;
  take(count: number): T[];
  takeWhile(predicate: (item: T) => boolean): T[];
  toArray(): T[];
  union(secondArray: T[]): T[];
  where(predicate: (item: T) => boolean): Array<T>;
  zip<U, V>(secondArray: U[], resultSelector: (first: T, second: U) => V): V[];
}
