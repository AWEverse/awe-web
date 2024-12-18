import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAsyncOptions<T> {
  defaultValue?: T;
  retries?: number;
  retryDelay?: number;
}

interface UseAsyncResult<T> {
  isLoading: boolean;
  error: Error | undefined;
  result: T | undefined;
}

/**
 * Creates a custom hook that handles asynchronous operations.
 *
 * @param {() => Promise<T>} callback - The function that returns a promise.
 * @param {React.DependencyList | undefined} deps - The dependencies for the effect.
 * @param {UseAsyncOptions<T>} options - The options for the hook.
 * @param {T | undefined} options.defaultValue - The default value for the result.
 * @param {number} options.retries - The number of retries for the operation.
 * @param {number} options.retryDelay - The delay between retries.
 * @returns {UseAsyncResult<T> & { refetch(): void }} - The state and refetch function.
 */
const useAsync = <T>(
  callback: () => Promise<T>,
  deps?: React.DependencyList,
  options: UseAsyncOptions<T> = {},
): UseAsyncResult<T> & { refetch: () => void } => {
  const { defaultValue, retries = 0, retryDelay = 1000 }: UseAsyncOptions<T> = options;

  const [state, setState] = useState<UseAsyncResult<T>>({
    isLoading: true,
    error: undefined,
    result: defaultValue,
  });

  const retryCountRef = useRef<number>(0);
  const wasCancelledRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDataAsync = useCallback(async (): Promise<void> => {
    setState({ isLoading: true, error: undefined, result: defaultValue });
    wasCancelledRef.current = false;
    retryCountRef.current = 0;

    const executeFetchAsync = async (): Promise<void> => {
      if (wasCancelledRef.current) return;

      try {
        abortControllerRef.current = new AbortController();
        const res = await callback();
        if (!wasCancelledRef.current) {
          setState({ isLoading: false, error: undefined, result: res });
        }
      } catch (err) {
        if (!wasCancelledRef.current) {
          if (retryCountRef.current < retries) {
            retryCountRef.current += 1;
            const delay = retryDelay * 2 ** retryCountRef.current; // Exponential backoff
            retryTimeoutRef.current = setTimeout(executeFetchAsync, delay);
          } else {
            setState({
              isLoading: false,
              error: err as Error,
              result: undefined,
            });
          }
        }
      }
    };

    executeFetchAsync();
  }, [callback, defaultValue, retries, retryDelay]);

  useEffect(() => {
    fetchDataAsync();

    return () => {
      wasCancelledRef.current = true;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [deps, fetchDataAsync]);

  const refetch = useCallback((): void => {
    fetchDataAsync();
  }, [fetchDataAsync]);

  return { ...state, refetch };
};

export default useAsync;
