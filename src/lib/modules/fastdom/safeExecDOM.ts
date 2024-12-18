// #v-ifdef DEBUG
// @ts-ignore
import { DEBUG } from '@/lib/config/dev';
// #v-endif

import { getIsStrict, getPhase, setPhase } from './stricterdom';

type DOMCallback = NoneToAnyFunction;
type RollbackFunction = NoneToVoidFunction;

interface ExecOptions {
  rescue?: (err: Error) => void;
  always?: NoneToVoidFunction;
  strict?: boolean;
  rollback?: RollbackFunction;
}

export default function safeExecDOM(
  cb: DOMCallback,
  { rescue, always, strict = false, rollback }: ExecOptions = {},
) {
  const phase = getPhase();
  const isStrictMode = strict || getIsStrict();

  // #v-ifdef DEBUG
  if (isStrictMode && phase !== 'mutate') {
    console.warn('DOM mutations should only occur during the "mutate" phase');
  }
  // #v-endif

  let result: unknown;
  let errorOccurred = false;

  try {
    result = cb();
  } catch (err: unknown) {
    errorOccurred = true;

    // #v-ifdef DEBUG
    console.error('Error during DOM manipulation', err);
    // #v-endif

    rescue?.(err as Error);

    // #v-ifdef DEBUG
    handleDOMError(err);
    // #v-endif

    if (rollback) {
      // #v-ifdef DEBUG
      console.log('Attempting rollback...');
      // #v-endif

      rollback();
    }

    result = undefined;
  } finally {
    always?.();

    if (isStrictMode && errorOccurred) {
      resetPhaseToSafeState();
    }
  }

  return result;
}

// #v-ifdef DEBUG
function handleDOMError(err: unknown) {
  if (err instanceof Error) {
    throw err;
  }

  throw new Error(`DOM operation failed: ${err as string}`);
}
// #v-endif

function resetPhaseToSafeState() {
  // #v-ifdef DEBUG
  console.warn("Reverting phase to 'measure'");
  // #v-endif

  setPhase('measure');
}
