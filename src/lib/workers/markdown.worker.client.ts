import { generateUniqueId } from "../hooks/utilities/useUniqueId";

export interface MarkdownWorkerRequest {
  id: string;
  markdownText?: string;
  messages?: { id: string; markdownText: string }[];
  config?: { extensions?: ((md: any) => void)[] };
  enableStats?: boolean;
}

export interface MarkdownWorkerResponse {
  id: string;
  html?: string;
  diagnostics?: {
    timeMs: number;
    count: number;
  };
  error?: string;
}

export interface MarkdownWorkerBatchResponse {
  batch: Array<MarkdownWorkerResponse>;
}

export interface MarkdownResult {
  html: string;
  diagnostics?: {
    timeMs: number;
    count: number;
  };
}

type Callback = (result: MarkdownResult | Error) => void;

let workerSingleton: Worker | null = null;
const callbacks = new Map<string, Callback>();
let workerInitError: string | null = null;



function handleWorkerMessage(event: MessageEvent<MarkdownWorkerResponse>) {
  const { id, html, diagnostics, error } = event.data;
  const callback = callbacks.get(id);
  if (!callback) return;

  if (error) {
    callback(new Error(error));
  } else {
    callback({ html: html || "", diagnostics });
  }
  callbacks.delete(id);
}

function handleWorkerError(error: ErrorEvent) {
  workerInitError = `Worker error: ${error.message}`;
  console.error(workerInitError);
}

function initWorker(): void {
  if (typeof window === "undefined" || workerSingleton) return;

  try {
    workerSingleton = new Worker("/src/lib/workers/markdown.worker.js", {
      type: "module",
    });

    workerSingleton.onmessage = handleWorkerMessage;
    workerSingleton.onerror = handleWorkerError;
  } catch (err) {
    workerInitError =
      err instanceof Error
        ? `Failed to initialize markdown worker: ${err.message}`
        : "Failed to initialize markdown worker: Unknown error";
  }
}

export async function processMarkdownWorker(
  markdownText: string,
  options: {
    config?: { extensions?: ((md: any) => void)[] };
    enableStats?: boolean;
  } = {}
): Promise<MarkdownResult> {
  initWorker();

  if (!workerSingleton) {
    throw new Error(workerInitError || "Markdown worker not initialized");
  }

  const id = generateUniqueId();

  return new Promise<MarkdownResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      callbacks.delete(id);
      reject(new Error("Markdown worker timeout"));
    }, 5000);

    callbacks.set(id, (result) => {
      clearTimeout(timeout);
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });

    const request: MarkdownWorkerRequest = {
      id,
      markdownText,
      ...options,
    };

    try {
      if (!workerSingleton) {
        throw new Error("Markdown worker not initialized");
      }

      workerSingleton.postMessage(request);
    } catch (err) {
      callbacks.delete(id);
      reject(err instanceof Error ? err : new Error("Unknown postMessage error"));
    }
  });
}

export function getMarkdownWorkerError(): string | null {
  return workerInitError;
}

/**
 * Optional: Cleanup function if you need to reload or reset worker state
 */
export function destroyMarkdownWorker(): void {
  if (workerSingleton) {
    workerSingleton.terminate();
    workerSingleton = null;
  }
  callbacks.clear();
  workerInitError = null;
}
