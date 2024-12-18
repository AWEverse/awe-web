export default function safeExec(cb: NoneToVoidFunction, rescue?: (err: Error) => void, always?: NoneToVoidFunction) {
  try {
    return cb();
  } catch (err: unknown) {
    rescue?.(err as Error);
    handleError(err);
    return undefined;
  } finally {
    always?.();
  }
}

function handleError(err: unknown) {
  if (err instanceof Error) {
    throw err;
  }

  throw new Error(err as string);
}
