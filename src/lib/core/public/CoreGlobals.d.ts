/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A branded type to prevent misuse of values by associating a unique identifier.
 * Used to distinguish specific Uint8Array instances (e.g., PublicKey, PrivateKey) from generic ones.
 * @template T The base type to brand (e.g., Uint8Array).
 * @template B The unique brand identifier as a string literal.
 *
 * @todo move to CoreGlobals.d.ts
 */
type Brand<T, B extends string> = T & { __brand: B };

type ReadonlyPartial<T> = Partial<Readonly<T>>;

/**
 * Creates a version of a given type where all properties are `undefined`.
 * @template T - The type to convert to undefined.
 */
type Undefined<T> = { [K in keyof T]: undefined };

type NewMutableRefObject = Mutable<React.RefObject<T>>;

type StartsWithUnderscore<T extends string> = T extends `_${string}`
  ? T
  : never;

/**
 * The `Impossible<T>` type maps over the properties of `T` (if any) and transforms them all into `never`.
 * It effectively renders any valid key in `T` impossible to use in actual code by assigning it the `never` type.
 *
 * This utility is often used in scenarios where certain states or cases are logically unreachable,
 * and we want to prevent any attempt to access those keys at compile-time.
 *
 * @example
 * type Example = Impossible<{ a: string, b: number }>;
 * // The resulting type `Example` will be:
 * // { a: never; b: never }
 *
 * @template T - The type whose keys will be transformed to `never`.
 */
type Impossible<T> = { [P in keyof T]: never };

/**
 * The `ValueOf<T>` utility type retrieves the value type of the properties in an object or the elements in an array.
 *
 * This type is useful when you have an object or an array and you want to get the type of its values.
 *
 * @example
 * type ExampleObject = { a: string, b: number };
 * type Value = ValueOf<ExampleObject>;
 * // The resulting type `Value` will be:
 * // string | number
 *
 * @template T - The object or array type to extract the value type from.
 */
type ValueOf<T> = T[keyof T];

/**
 * The `NoExtraProperties<T, U>` type ensures that `U` can only have properties that exist on `T`
 * and disallows any extra properties. If `U` contains additional keys that are not present in `T`,
 * they will be marked as `never` by using the `Impossible` type, effectively preventing extra properties from being assigned.
 *
 * This type is useful for enforcing strict type checks where only a defined set of properties is allowed,
 * and any other properties would result in a compile-time error.
 *
 * @template T - The base type that defines the allowed properties.
 * @template U - The type to check against `T`. This type should either match `T` or have a subset of its properties.
 *
 * @example
 * type Base = { a: string, b: number };
 *
 * // Valid usage:
 * const valid: NoExtraProperties<Base, { a: string, b: number }> = { a: "hello", b: 42 };
 *
 * // Error: Type '{ a: string; b: number; c: boolean; }' is not assignable
 * // to type 'NoExtraProperties<Base, { a: string; b: number; c: boolean; }>'
 * const invalid: NoExtraProperties<Base, { a: string, b: number, c: boolean }> = { a: "hello", b: 42, c: true };
 */
type NoExtraProperties<T, U extends T = T> = U &
  Impossible<Exclude<keyof U, keyof T>>;

/**
 * The `ModifyFunctionsToAsync<T>` type recursively modifies the function types in `T` by ensuring that
 * the return type of each function is wrapped in a `Promise`. If the return type of a function is already
 * a `Promise` (or a `PromiseLike`), the function signature remains unchanged; otherwise, it will be converted
 * to return a `Promise` of the original return type.
 *
 * This is useful for situations where you need to convert all functions in an interface or type to async functions,
 * allowing you to handle their results as `Promises` consistently.
 *
 * @template T - The type where each function's return type will be modified to a `Promise`.
 *
 * @example
 * type SyncMethods = {
 *   syncFunc: (x: number) => string;
 *   alreadyAsyncFunc: (x: number) => Promise<string>;
 * };
 *
 * type AsyncMethods = ModifyFunctionsToAsync<SyncMethods>;
 *
 * // The resulting `AsyncMethods` type will be:
 * // {
 * //   syncFunc: (x: number) => Promise<string>;
 * //   alreadyAsyncFunc: (x: number) => Promise<string>;
 * // }
 */
type ModifyFunctionsToAsync<T> = {
  [key in keyof T]: T[key] extends (...args: infer A) => infer R
  ? R extends PromiseLike
  ? T[key]
  : (...args: A) => Promise<Awaited<R>>
  : T[key];
};

/**
 * The `Mutable<T>` type removes the `readonly` modifier from all properties in a given type `T`,
 * making them mutable (i.e., allowing them to be reassigned).
 *
 * This is useful when you want to convert a type with readonly properties into a type where the properties can be modified.
 *
 * @template T - The type whose properties should be made mutable.
 *
 * @example
 * type ReadonlyPerson = {
 *   readonly name: string;
 *   readonly age: number;
 * };
 *
 * type MutablePerson = Mutable<ReadonlyPerson>;
 * // The resulting type `MutablePerson` will be:
 * // {
 * //   name: string;
 * //   age: number;
 * // }
 */
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * The `PickByType<T, Value>` type creates a new type by picking only the properties from `T` whose values are assignable
 * to the type `Value`. If the value type of a property is `Value` (or `undefined`), that property is included in the new type.
 *
 * This is useful when you want to extract specific properties from a type based on their value type.
 *
 * @template T - The type from which to pick properties.
 * @template Value - The type that the property values should match in order to be included.
 *
 * @example
 * type Person = {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 *   address?: string;
 * };
 *
 * type StringProperties = PickByType<Person, string>;
 * // The resulting type `StringProperties` will be:
 * // {
 * //   name: string;
 * //   address?: string;
 * }
 *
 * type OptionalProperties = PickByType<Person, undefined>;
 * // The resulting type `OptionalProperties` will be:
 * // {
 * //   address?: string;
 * // }
 */
type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P];
};

/**
 * The `FixedSizeArray<T, N>` type creates a tuple type of a fixed size `N` where each element is of type `T`.
 *
 * This type ensures that the resulting array (or tuple) has exactly `N` elements, all of type `T`, and it will not accept arrays
 * with a different size or different types of elements.
 *
 * This type is recursive and uses two helper types (`GrowExp` and `GrowExpRev`) to efficiently generate arrays of the desired size.
 *
 * @template T - The type of each element in the array.
 * @template N - The desired length of the array.
 *
 * @example
 * type ThreeNumbers = FixedSizeArray<number, 3>;
 * // The resulting type `ThreeNumbers` will be:
 * // [number, number, number]
 *
 * type StringArray = FixedSizeArray<string, 5>;
 * // The resulting type `StringArray` will be:
 * // [string, string, string, string, string]
 *
 * type EmptyArray = FixedSizeArray<number, 0>;
 * // The resulting type `EmptyArray` will be:
 * // []
 */
type FixedSizeArray<T, N extends number> = N extends 0
  ? []
  : N extends 1
  ? [T]
  : ExpandArrayUntilLengthReached<[T, T], N, [[T]]>;

/**
 * Represents types that are considered "falsy" in JavaScript.
 */
type Falsy = false | 0n | 0 | -0 | number & typeof NaN | "" | null | undefined;
/**
 * Represents types that are inherently "truthy" (non-falsy).
 */
type Truthy<T> = T extends Falsy ? never : T;

/**
 * Custom constructor interface for `Boolean`, ensuring proper type inference for `Falsy` values.
 */
interface BooleanConstructor {
  new <T>(value?: T | Falsy): value is T;
  <T>(value?: T | Falsy): value is T;
  readonly prototype: boolean;
}

/**
 * A custom implementation of the `Boolean` constructor, ensuring that it works similarly to `!!value`.
 * @param value - The value to coerce into a boolean.
 * @returns A boolean indicating the truthiness of the value.
 */
declare const Boolean: BooleanConstructor;



/**
 * Extends the HTMLElement interface to include cross-browser fullscreen support methods.
 */
// interface HTMLElement {
//   requestFullscreen?: () => Promise<void>;
//   msRequestFullscreen?: () => Promise<void>;
//   mozRequestFullScreen?: () => Promise<void>;
//   webkitRequestFullscreen?: () => Promise<void>;
// }

type PartialHTMLElementSupport = {
  requestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
} & HTMLElement;

type PartialDocumentSupport = {
  exitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;

  fullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
} & Document;

interface HTMLVideoElement {
  // WebKit methods
  webkitSetPresentationMode?(
    mode: "picture-in-picture" | "inline" | "fullscreen",
  ): Promise<void>;
  webkitSupportsPresentationMode?(mode: string): boolean;
  webkitRequestPictureInPicture?(): Promise<void>;

  // Standard methods
  requestPictureInPicture?(): Promise<void>;
}

interface Document {
  // WebKit methods
  webkitExitPictureInPicture?(): Promise<void>;

  // Standard properties
  pictureInPictureEnabled?: boolean;
  pictureInPictureElement?: Element | null;
}

interface DocumentOrShadowRoot {
  pictureInPictureElement?: Element | null;
}

/**
 * Represents the union of two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type Union<A, B> = A & B;

/**
 * Represents the intersection of two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type Intersection<A, B> = A extends B ? A : never;

/**
 * Represents the difference between two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type Difference<A, B> = A extends B ? never : A;

/**
 * Represents the symmetric difference between two types.
 * @template A - The first type.
 * @template B - The second type.
 */
type SymmetricDifference<A, B> = Difference<A, B> | Difference<B, A>;

/**
 * Represents the complement of two types.
 * @template A - The first type.
 * @template B - The second type which extends A.
 */
type Complement<A, B extends A> = Difference<B, A>;

/**
 * Combines two types where optional fields from both are combined.
 * @template A - The first type.
 * @template B - The second type.
 */
type OptionalCombine<A, B> =
  | Intersection<A, B>
  | Intersection<A | Undefined<B>>;

/**
 * Extracts the element type from a readonly array.
 * @template T - The array type.
 */
type ElementType<T> = T extends ReadonlyArray<infer E> ? E : never;

/**
 * Recursively extracts the elements of a nested array type.
 * @template T - The array type.
 * @template R - An accumulator array type (defaults to an empty array).
 */
type ElementsOfAll<
  T,
  R extends ReadonlyArray<unknown> = [],
> = T extends readonly [infer F, ...infer M]
  ? ElementsOfAll<M, [...R, ElementType<F>]>
  : R;

/**
 * Represents the cartesian product of elements from an array type.
 * @template T - The array type.
 */
type CartesianProduct<T> = ElementsOfAll<T>[];

/**
 * Represents the powerset of a given type, where each property is an array.
 * @template T - The base type.
 */
type PowerSet<T> = {
  [K in keyof T]?: T[K][];
};

/**
 * Represents the common properties between two types.
 * @template T - The first type.
 * @template U - The second type.
 */
type CommonProperties<T, U> = {
  [K in keyof T & keyof U]: T[K] | U[K];
};

/**
 * A function type that takes no arguments and returns `void`.
 * @returns {void}
 */
type NoneToVoidFunction = () => void;

/**
 * @returns {any}
 */
type NoneToAnyFunction = () => any;

/**
 * @param {any} props - The props of the component.
 * @returns {FC<any>} - A React functional component.
 */
type AnyToFunctionalComponent = (props: any) => FC<any>;

/**
 * A type for an object with string keys and values of any type.
 */
type AnyLiteral = Record<string, any>;

/**
 * A type for a class constructor function that can accept any number of arguments and return an instance of any class.
 */
type AnyClass = new (...args: any[]) => any;

/**
 * A type for a function that accepts any number of arguments and returns any value of any type.
 */

/**
 * @param {...any[]} args - The arguments of the function.
 */
type AnyFunction = (...args: any[]) => any;

/**
 * @param {...any[]} args - The arguments of the function.
 * @returns {void}
 */
type AnyToVoidFunction = (...args: any[]) => void;

/**
 * A type for an array that can contain elements of any type.
 */
type AnyArray = any[];

/**
 * A type that represents either a given type `T` or `null`. By default, `T` is set to `null`.
 * @template T
 */
type Nullable<T = null> = T | null;

/**
 * A type that excludes `null` and `undefined` from type `T`.
 * @template T
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * `ArgumentTypes` extracts the argument types of a function type `F` as a tuple.
 *
 * @template F - The function type from which to extract the argument types.
 *
 * This type infers and returns the types of the parameters of the function `F`. If `F` is not a function, it will result in `never`.
 *
 * @example
 * type Args = ArgumentTypes<(a: string, b: number) => void>;
 * // Resulting type: [string, number]
 */
type ArgumentTypes<F extends AnyFunction> = F extends (...args: infer A) => any
  ? A
  : never;

/**
 * `SuperReturnType` extracts the return type of a function `F`.
 * If the function `F` does not match the expected function shape, it will result in `never`.
 *
 * @template F - The function type from which to extract the return type.
 *
 * This type ensures that you get the return type of `F`, or `never` if `F` is not a function.
 *
 * @example
 * type ReturnT = SuperReturnType<(a: string, b: number) => string>;
 * // Resulting type: string
 */
type SuperReturnType<F extends AnyFunction> = F extends (...args: any) => any
  ? ReturnType<F>
  : never;


/**
 * Asserts that the given value is of a specific type `T`.
 *
 * @template T - The expected type.
 * @param {unknown} x - The value to assert the type of.
 * @throws {TypeError} If the value is not of type `T`.
 */
declare function assumeType<T>(x: unknown): asserts x is T;

/**
 * Checks if a given value exists (is not `null` or `undefined`).
 *
 * @template T - The type of the value.
 * @param {T} maybe - The value to check for existence.
 * @returns {maybe is NonNullable<T>} - True if the value is not `null` or `undefined`, false otherwise.
 */
declare function exists<T>(maybe: T): maybe is NonNullable<T> {
  return maybe != null;
}

/**
 * Asserts that a given value exists (is not `null` or `undefined`).
 *
 * @template T - The type of the value.
 * @param {unknown} maybe - The value to assert existence for.
 * @throws {Error} If the value is `null` or `undefined`.
 */
declare function assertExists<T>(maybe: unknown): asserts maybe is NonNullable<T> {
  if (maybe == null) {
    throw new Error(`${maybe} doesn't exist`);
  }
}

/**
 * Represents a fuzzy set, where each element has a membership degree.
 * @template T - The type of elements in the fuzzy set.
 */
type FuzzySet<T> = { element: T; membershipDegree: number }[];

/**
 * Represents a graph vertex type.
 */
type Vertex = string | number;

/**
 * Represents an edge in a graph, defined as a pair of vertices.
 * @template T - The vertex type (defaults to `Vertex`).
 */
type Edge<T extends Vertex = Vertex> = [T, T];

/**
 * Represents an adjacency list in a graph, mapping vertices to their neighbors.
 * @template T - The vertex type (defaults to `Vertex`).
 */
type AdjacencyList<T extends Vertex = Vertex> = Map<T, T[]>;

/**
 * Represents a graph data structure.
 * @template T - The vertex type (defaults to `Vertex`).
 */
interface Graph<T extends Vertex = Vertex> {
  vertices: Set<T>;
  edges: Set<Edge<T>>;
  adjacencyList: AdjacencyList<T>;
}

/**
 * The `ExpandArrayUntilLengthReached` type recursively expands the given array (`CurrentArray`) until its length matches the target length (`TargetLength`).
 * It uses the provided `Buffers` (which are arrays) to grow the array until the desired length is achieved.
 *
 * @template CurrentArray - The array that is currently being expanded.
 * @template TargetLength - The length the array should reach.
 * @template Buffers - An array of additional arrays that are used to grow the array step by step.
 *
 * This type is used to gradually expand an array by appending values from the `Buffers` until the array's length matches `TargetLength`.
 *
 * @example
 * type ExpandedArray = ExpandArrayUntilLengthReached<[1, 2], 5, [[3], [4], [5]]>;
 * // Resulting type: [1, 2, 3, 4, 5]
 */
type ExpandArrayUntilLengthReached<
  CurrentArray extends Array<any>,
  TargetLength extends number,
  Buffers extends Array<Array<any>>,
> = CurrentArray["length"] extends TargetLength
  ? CurrentArray
  : {
    0: ExpandArrayUntilLengthReached<
      [...CurrentArray, ...Buffers[0]],
      TargetLength,
      Buffers
    >;
    1: ExpandArrayUntilLengthReached<
      CurrentArray,
      TargetLength,
      ShiftArray<Buffers>
    >;
  }[[...CurrentArray, ...Buffers[0]][TargetLength] extends undefined ? 0 : 1];

/**
 * The `ExponentiallyExpandArray` type exponentially doubles the current array (`CurrentArray`) until its length reaches the target length (`TargetLength`).
 * It also uses the `Buffers` to achieve the final length. This type is more efficient when doubling the array size in each recursion step.
 *
 * @template CurrentArray - The array that is currently being expanded.
 * @template TargetLength - The length the array should reach.
 * @template Buffers - An array of additional arrays used to help expand the array.
 *
 * This type is particularly useful for cases where you want to double the array size efficiently while growing towards a target length.
 * It combines exponential growth with the use of buffers to reach the target length more efficiently.
 *
 * @example
 * type ExponentiallyExpandedArray = ExponentiallyExpandArray<[1], 8, [[2]]>;
 * // Resulting type: [1, 1, 1, 1, 1, 1, 1, 1]
 */
type ExponentiallyExpandArray<
  CurrentArray extends Array<any>,
  TargetLength extends number,
  Buffers extends Array<Array<any>>,
> = CurrentArray["length"] extends TargetLength
  ? CurrentArray
  : {
    0: ExponentiallyExpandArray<
      [...CurrentArray, ...CurrentArray],
      TargetLength,
      [CurrentArray, ...Buffers]
    >;
    1: ExpandArrayUntilLengthReached<CurrentArray, TargetLength, Buffers>;
  }[[...CurrentArray, ...CurrentArray][TargetLength] extends undefined
  ? 0
  : 1];

