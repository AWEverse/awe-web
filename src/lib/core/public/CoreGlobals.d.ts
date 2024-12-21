/* eslint-disable @typescript-eslint/no-explicit-any */

// Utility Types
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

// Array Extensions
interface Array<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[];
}

interface ReadonlyArray<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: any): Exclude<S, Falsy>[];
}

// Set Theory Types
type Union<A, B> = A & B;
type Intersection<A, B> = A extends B ? A : never;
type Difference<A, B> = A extends B ? never : A;
type SymmetricDifference<A, B> = Difference<A, B> | Difference<B, A>;
type Complement<A, B extends A> = Difference<B, A>;

// Type Operations
type OptionalCombine<A, B> = Intersection<A, B> | Intersection<A | Undefined<B>>;

// Extracting Element Types
type ElementType<T> = T extends ReadonlyArray<infer E> ? E : never;
type ElementsOfAll<T, R extends ReadonlyArray<unknown> = []> = T extends readonly [
  infer F,
  ...infer M,
]
  ? ElementsOfAll<M, [...R, ElementType<F>]>
  : R;
type CartesianProduct<T> = ElementsOfAll<T>[];

// PowerSet
type PowerSet<T> = {
  [K in keyof T]?: T[K][];
};

// De Morgan's Law
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

// Common Properties between two types
type CommonProperties<T, U> = {
  [K in keyof T & keyof U]: T[K] | U[K];
};

// Generic function types
type NoneToVoidFunction = () => void;
type NoneToAnyFunction = () => any;
type UnknownFunction = (...args: unknown[]) => unknown;

// Fuzzy Set
type FuzzySet<T> = { element: T; membershipDegree: number }[];

// Graph Types
type Vertex = string | number;
type Edge<T extends Vertex = Vertex> = [T, T];
type AdjacencyList<T extends Vertex = Vertex> = Map<T, T[]>;

interface Graph<T extends Vertex = Vertex> {
  vertices: Set<T>;
  edges: Set<Edge<T>>;
  adjacencyList: AdjacencyList<T>;
}

// Array Methods Extensions
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
  joins<U, K, V>(
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
