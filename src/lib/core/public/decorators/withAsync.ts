interface LoadingProps {
  pending?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

const withAsync = (props: LoadingProps): Promise<void> => {
  const { pending = 2000, retries = 3, retryDelay = 1000, timeout = 10000 } = props;

  const performAsyncOperation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve();
        } else {
          reject(new Error('Something went wrong'));
        }
      }, pending);
    });
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const attemptOperation = async (attemptsLeft: number, delayTime: number): Promise<void> => {
    try {
      await performAsyncOperation();
    } catch (error) {
      if (attemptsLeft <= 0) {
        throw error;
      }
      const jitter = Math.random() * 100;
      const nextDelay = delayTime + jitter;

      await delay(nextDelay);

      return attemptOperation(attemptsLeft - 1, nextDelay * 2);
    }
  };

  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeout);
  });

  return Promise.race([timeoutPromise, attemptOperation(retries, retryDelay)]);
};

export default withAsync;
