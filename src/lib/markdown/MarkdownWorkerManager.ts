export interface MarkdownWorkerRequest {
  id: string;
  markdownText?: string;
  messages?: { id: string; markdownText: string }[];
  config?: { extensions?: any[] };
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

let workerSingleton: Worker | null = null;
const callbacksSingleton: Map<string, (result: MarkdownResult | Error) => void> = new Map();
let workerInitError: string | null = null;

function initWorker() {
  if (typeof window === "undefined" || workerSingleton) return;
  try {
    workerSingleton = new Worker(
      "/src/lib/workers/markdown.worker.js",
      { type: "module" }
    );
    workerSingleton.onmessage = (event: MessageEvent<MarkdownWorkerResponse>) => {
      const { id } = event.data;
      const callback = callbacksSingleton.get(id);
      if (callback) {
        if ("error" in event.data) {
          callback(new Error(event.data.error));
        } else {
          callback({
            html: event.data.html || "",
            diagnostics: event.data.diagnostics,
          });
        }
        callbacksSingleton.delete(id);
      }
    };
    workerSingleton.onerror = (error) => {
      workerInitError = `Worker error: ${error.message}`;
    };
  } catch (err) {
    if (err instanceof Error) {
      workerInitError = `Failed to initialize markdown worker: ${err.message}`;
    } else {
      workerInitError = "Failed to initialize markdown worker: Unknown error";
    }
  }
}

export async function processMarkdownWorker(
  content: string,
  options: { config?: { extensions?: any[] }; enableStats?: boolean } = {}
): Promise<MarkdownResult> {
  if (!workerSingleton) {
    initWorker();
    if (!workerSingleton) {
      throw new Error(workerInitError || "Markdown worker not initialized");
    }
  }
  const id = `md_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return new Promise<MarkdownResult>((resolve, reject) => {
    callbacksSingleton.set(id, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
    workerSingleton!.postMessage({
      id,
      markdownText: content,
      ...options,
    } as MarkdownWorkerRequest);
  });
}

export function getMarkdownWorkerError() {
  return workerInitError;
}
