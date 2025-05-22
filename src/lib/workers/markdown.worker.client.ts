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

function calculateDynamicTimeout(markdownText: string): number {
  const baseTimeout = 5000; // 5 seconds base timeout
  const charsPerSecond = 1000; // Assume 1000 characters processed per second
  const estimatedTime = Math.ceil(markdownText.length / charsPerSecond) * 1000;
  return Math.max(baseTimeout, estimatedTime);
}

function handleWorkerMessage(event: MessageEvent<MarkdownWorkerResponse>) {
  const { id, html, diagnostics, error } = event.data;
  console.log(`Received worker response for ID ${id}`, {
    html,
    diagnostics,
    error,
  });
  const callback = callbacks.get(id);
  if (!callback) {
    console.warn(`No callback found for worker response ID ${id}`);
    return;
  }

  if (error) {
    callback(new Error(error));
  } else {
    callback({ html: html || "", diagnostics });
  }
  callbacks.delete(id);
}

function handleWorkerError(error: ErrorEvent) {
  workerInitError = `Worker error: ${error.message}. Please check your network connection or try again later.`;
  console.error(workerInitError, {
    filename: error.filename,
    lineno: error.lineno,
    colno: error.colno,
  });
}

function initWorker(): void {
  if (typeof window === "undefined" || workerSingleton) {
    console.log(
      "Worker initialization skipped: window undefined or worker already exists",
    );
    return;
  }

  try {
    console.log("Initializing markdown worker...");
    workerSingleton = new Worker(
      new URL("./markdown.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerSingleton.onmessage = handleWorkerMessage;
    workerSingleton.onerror = handleWorkerError;
    console.log("Markdown worker initialized successfully");
  } catch (err) {
    workerInitError =
      err instanceof Error
        ? `Failed to initialize markdown worker: ${err.message}`
        : "Failed to initialize markdown worker: Unknown error";
    console.error(workerInitError);
  }
}

export async function processMarkdownWorker(
  markdownText: string,
  options: {
    config?: { extensions?: ((md: any) => void)[] };
    enableStats?: boolean;
    timeoutMs?: number;
    maxRetries?: number;
  } = {},
): Promise<MarkdownResult> {
  initWorker();

  if (!workerSingleton) {
    throw new Error(
      workerInitError ||
      "Markdown worker not initialized. Please check your network or browser compatibility.",
    );
  }

  const id = generateUniqueId();
  const timeoutDuration =
    options.timeoutMs || calculateDynamicTimeout(markdownText);
  const maxRetries = options.maxRetries ?? 2;
  let retryCount = 0;

  const attemptProcessing = (): Promise<MarkdownResult> => {
    return new Promise<MarkdownResult>((resolve, reject) => {
      const timeout = setTimeout(() => {
        callbacks.delete(id);
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(
            `Retry ${retryCount}/${maxRetries} for markdown processing (ID: ${id})`,
          );
          destroyMarkdownWorker();
          initWorker();
          if (!workerSingleton) {
            reject(
              new Error(
                "Failed to reinitialize worker for retry. Please check your network connection.",
              ),
            );
            return;
          }
          attemptProcessing().then(resolve).catch(reject);
        } else {
          const errorMessage = `Markdown processing timed out after ${timeoutDuration / 1000} seconds and ${maxRetries} retries. Consider simplifying the markdown input (current size: ${markdownText.length} characters) or trying again later.`;
          reject(new Error(errorMessage));
        }
      }, timeoutDuration);

      callbacks.set(id, (result) => {
        clearTimeout(timeout);
        if (result instanceof Error) {
          reject(
            new Error(
              `${result.message}. Input size: ${markdownText.length} characters.`,
            ),
          );
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
        reject(
          err instanceof Error
            ? new Error(
              `${err.message}. Please ensure the markdown worker script is accessible.`,
            )
            : new Error("Unknown postMessage error"),
        );
      }
    });
  };

  return attemptProcessing();
}

export function getMarkdownWorkerError(): string | null {
  return workerInitError;
}

export function destroyMarkdownWorker(): void {
  if (workerSingleton) {
    workerSingleton.terminate();
    workerSingleton = null;
  }
  callbacks.clear();
  workerInitError = null;
}
