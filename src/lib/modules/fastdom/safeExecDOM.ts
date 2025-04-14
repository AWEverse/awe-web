// #v-ifdef DEBUG
// @ts-ignore
import { DEBUG } from "@/lib/config/dev";
// #v-endif
import { getIsStrict, getDOMPhase, setDOMPhase } from "./stricterdom";

type DOMOperation<T = any> = () => T;
type ErrorHandler = (error: Error) => void;
type RollbackHandler = () => void;

interface ExecutionConfig {
  rescue?: ErrorHandler;
  always?: () => void;
  strict?: boolean;
  rollback?: RollbackHandler;
  /**
   * Если true, выбрасывать ошибку даже в продакшене.
   */
  throwOnError?: boolean;
}

const safeExecDOM = <T = any>(
  operation: DOMOperation<T>,
  config: ExecutionConfig = {},
): T | undefined => {
  const { rescue, always, strict = false, rollback, throwOnError = false } = config;
  const phase = getDOMPhase();
  const isStrictMode = strict || getIsStrict();
  let result: T | undefined;
  let error: Error | undefined;

  // #v-ifdef DEBUG
  if (isStrictMode && phase !== "mutate") {
    console.warn('DOM mutations should only occur during "mutate" phase');
  }
  // #v-endif

  try {
    result = operation();
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));

    // #v-ifdef DEBUG
    console.error("DOM operation failed:", error);
    // #v-else
    console.error("DOM operation encountered an error:", error);
    // #v-endif

    rescue?.(error);
    rollback?.();

    if (throwOnError) {
      throw error;
    }

    // #v-ifdef DEBUG
    throw error;
    // #v-endif
  } finally {
    always?.();

    if (isStrictMode && error) {
      // #v-ifdef DEBUG
      console.warn("Resetting to safe measure phase");
      // #v-endif
      setDOMPhase("measure");
    }
  }

  return result;
};

export default safeExecDOM;
