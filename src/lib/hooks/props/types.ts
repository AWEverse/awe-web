// Incomplete type definitions for props resolvers

interface OwnPropsResolver<T extends Record<string, unknown>> {
  (props: T): T;
}

interface StatePropsResolver<T extends Record<Partial<string>, unknown>> {
  (state: T): T;
}

export type { OwnPropsResolver, StatePropsResolver };
