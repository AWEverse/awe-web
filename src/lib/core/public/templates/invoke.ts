type InvokeResult<TFunc extends AnyFunction> = ReturnType<TFunc>;

export function invoke<TFunc extends AnyFunction>(
  func: TFunc | undefined,
  ...args: Parameters<TFunc>
): InvokeResult<TFunc> {
  return func?.(...args);
}

type InvokeArgs<
  Obj,
  MethodName extends keyof Obj,
> = Obj[MethodName] extends AnyFunction ? Parameters<Obj[MethodName]> : never;

type InvokeResults<
  Obj,
  MethodName extends keyof Obj,
> = Obj[MethodName] extends AnyFunction ? ReturnType<Obj[MethodName]> : never;

export function invokeMethod<Obj, MethodName extends keyof Obj>(
  obj: Obj,
  methodName: MethodName,
  ...args: InvokeArgs<Obj, MethodName>
): InvokeResults<Obj, MethodName> {
  const method = obj[methodName] as unknown;
  return (method as AnyFunction).apply(obj, args);
}

export function projection<TFunc extends AnyFunction>(func: TFunc) {
  return (...args: Parameters<TFunc>) => func(...args);
}

export function cachedInvoke<TFunc extends AnyFunction>(
  func: TFunc,
  cache: Map<string, ReturnType<TFunc>> = new Map(),
): (...args: Parameters<TFunc>) => ReturnType<TFunc> {
  return (...args: Parameters<TFunc>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

export function safeInvoke<TFunc extends AnyFunction>(
  func: TFunc,
  defaultValue?: ReturnType<TFunc>,
  onError?: (error: unknown, args: Parameters<TFunc>) => void,
) {
  return (...args: Parameters<TFunc>): ReturnType<TFunc> | undefined => {
    try {
      return func?.(...args);
    } catch (error) {
      if (onError) {
        onError(error, args);
      } else {
        console.error(`Error in safeInvoke: ${error}`, { args });
      }

      return defaultValue;
    }
  };
}
