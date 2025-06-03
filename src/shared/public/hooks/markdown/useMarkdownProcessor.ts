import { useState } from "react";
import { useStableCallback } from "../base";
import { processMarkdownWorker, MarkdownResult } from "@/lib/workers/markdown.worker.client";

export function useMarkdownProcessor() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processMarkdown = useStableCallback(async function (
    content: string,
    options: { config?: { extensions?: any[] }; enableStats?: boolean } = {},
  ): Promise<MarkdownResult> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await processMarkdownWorker(content, options);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  });

  return {
    processMarkdown,
    isLoading,
    error,
  };
}
