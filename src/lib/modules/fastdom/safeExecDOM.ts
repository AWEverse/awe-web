// #v-ifdef DEBUG
// @ts-ignore
import { DEBUG } from "@/lib/config/dev";
// #v-endif
import { getIsStrict, getPhase, setPhase } from "./stricterdom";

type DOMOperation<T = any> = () => T;
type ErrorHandler = (error: Error) => void;
type RollbackHandler = () => void;

interface ExecutionConfig {
  rescue?: ErrorHandler;
  always?: () => void;
  strict?: boolean;
  rollback?: RollbackHandler;
}

const safeExecDOM = <T = any>(
  operation: DOMOperation<T>,
  config: ExecutionConfig = {},
): T | undefined => {
  const { rescue, always, strict = false, rollback } = config;
  const phase = getPhase();
  const isStrictMode = strict || getIsStrict();
  let result: T | undefined;
  let error: Error | undefined;

  // Debug mode validation
  // #v-ifdef DEBUG
  if (isStrictMode && phase !== "mutate") {
    console.warn('DOM mutations should only occur during "mutate" phase');
  }
  // #v-endif

  try {
    result = operation();
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err));

    // Error handling pipeline
    // #v-ifdef DEBUG
    console.error("DOM operation failed:", error);
    // #v-endif

    rescue?.(error);
    rollback?.();

    // #v-ifdef DEBUG
    throw error; // Fail fast in development
    // #v-endif
  } finally {
    always?.();

    if (isStrictMode && error) {
      // #v-ifdef DEBUG
      console.warn("Resetting to safe measure phase");
      // #v-endif
      setPhase("measure");
    }
  }

  return result;
};

export default safeExecDOM;
