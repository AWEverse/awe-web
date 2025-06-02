class ValidationError extends Error {
  constructor(
    public code: string,
    public path: string[],
    message: string,
  ) {
    super(message);
  }
}

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

export class Schema<T> {
  constructor(
    public validate: (
      data: any,
      path: string[],
    ) => Promise<ValidationResult<T>>,
    public typeName: string,
  ) { }

  async parse(data: any): Promise<T> {
    const result = await this.validate(data, []);
    if (result.success) {
      return result.data;
    }
    throw result.error;
  }

  async safeParse(data: any): Promise<ValidationResult<T>> {
    return this.validate(data, []);
  }

  refine<U extends T>(
    refineFn: (data: T) => boolean | Promise<boolean>,
    error: { message: string; code: string },
  ): Schema<U> {
    return new Schema<U>(async (data: any, path: string[]) => {
      const baseResult = await this.validate(data, path);

      if (!baseResult.success) {
        return baseResult;
      }

      const refined = refineFn(baseResult.data);
      const isValid = refined instanceof Promise ? await refined : refined;

      if (isValid) {
        return { success: true, data: baseResult.data as U };
      }
      return {
        success: false,
        error: new ValidationError(error.code, path, error.message),
      };
    }, error.message || this.typeName);
  }
}

export const typify = {
  string: new Schema<string>(async (data: any, path: string[]) => {
    if (typeof data === "string") {
      return { success: true, data };
    }
    return {
      success: false,
      error: new ValidationError("INVALID_TYPE", path, "Expected string"),
    };
  }, "string"),
  number: new Schema<number>(async (data: any, path: string[]) => {
    if (typeof data === "number") {
      return { success: true, data };
    }
    return {
      success: false,
      error: new ValidationError("INVALID_TYPE", path, "Expected number"),
    };
  }, "number"),
  boolean: new Schema<boolean>(async (data: any, path: string[]) => {
    if (typeof data === "boolean") {
      return { success: true, data };
    }
    return {
      success: false,
      error: new ValidationError("INVALID_TYPE", path, "Expected boolean"),
    };
  }, "boolean"),
  unknown: new Schema<unknown>(
    async (_: unknown, __: string[]) => ({ success: true, data: _ }),
    "unknown",
  ),
  any: new Schema<any>(
    async (_: any, __: string[]) => ({ success: true, data: _ }),
    "any",
  ),
  literal: <T extends string | number | boolean>(value: T) =>
    new Schema<T>(async (data: any, path: string[]) => {
      if (data === value) {
        return { success: true, data };
      }
      return {
        success: false,
        error: new ValidationError(
          "INVALID_LITERAL",
          path,
          `Expected ${JSON.stringify(value)}`,
        ),
      };
    }, JSON.stringify(value)),
  array: <S extends Schema<any>>(schema: S) =>
    new Schema<Infer<S>[]>(async (data: any, path: string[]) => {
      if (!Array.isArray(data)) {
        return {
          success: false,
          error: new ValidationError("INVALID_TYPE", path, "Expected array"),
        };
      }
      const result: Infer<S>[] = [];
      for (let i = 0; i < data.length; i++) {
        const itemResult = await schema.validate(data[i], [
          ...path,
          i.toString(),
        ]);
        if (!itemResult.success) return itemResult;
        result.push(itemResult.data);
      }
      return { success: true, data: result };
    }, `Array<${schema.typeName}>`),
  object: <O extends Record<string, Schema<any>>>(shape: O) =>
    new Schema<{ [K in keyof O]: Infer<O[K]> }>(
      async (data: any, path: string[] = []) => {
        if (typeof data !== "object" || data === null) {
          return {
            success: false,
            error: new ValidationError("INVALID_TYPE", path, "Expected object"),
          };
        }
        const result: any = {};
        for (const key in shape) {
          const fieldResult = await shape[key].validate(data[key], [
            ...path,
            key,
          ]);
          if (!fieldResult.success) return fieldResult;
          result[key] = fieldResult.data;
        }
        return { success: true, data: result };
      },
      `{ ${Object.keys(shape)
        .map((k) => `${k}: ${shape[k].typeName}`)
        .join("; ")} }`,
    ),
  union: <A extends Schema<any>[]>(...schemas: A) =>
    new Schema<Infer<A[number]>>(
      async (data: any, path: string[]) => {
        for (const schema of schemas) {
          const result = await schema.validate(data, path);
          if (result.success) return result;
        }
        return {
          success: false,
          error: new ValidationError(
            "INVALID_UNION",
            path,
            "No matching schema",
          ),
        };
      },
      schemas.map((s) => s.typeName).join(" | "),
    ),
  optional: <S extends Schema<any>>(schema: S) =>
    new Schema<Infer<S> | undefined>(async (data: any, path: string[]) => {
      if (data === undefined) {
        return { success: true, data: undefined };
      }
      return schema.validate(data, path);
    }, `${schema.typeName} | undefined`),
  nullable: <S extends Schema<any>>(schema: S) =>
    new Schema<Infer<S> | null>(async (data: any, path: string[]) => {
      if (data === null) {
        return { success: true, data: null };
      }
      return schema.validate(data, path);
    }, `${schema.typeName} | null`),
};

export type Infer<S> = S extends Schema<infer U> ? U : never;
export const string = typify.string;
export const number = typify.number;
export const boolean = typify.boolean;
export const array = typify.array;
export const object = typify.object;
export const union = typify.union;
export const literal = typify.literal;
export const optional = typify.optional;
export const nullable = typify.nullable;
