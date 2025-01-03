import { randomInt } from '../math/utils';
import { pause } from '../schedulers';

interface LoadingProps {
  pending?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

const withAsync = (props: LoadingProps): Promise<void> => {
  const { pending = 2000, retries = 3, retryDelay = 1000, timeout = 10000 } = props;

  const performAsyncOperation = (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, pending);
    });
  };

  const attemptOperation = async (attemptsLeft: number, delayTime: number): Promise<void> => {
    try {
      await performAsyncOperation();
    } catch (error) {
      if (attemptsLeft <= 0) {
        throw error;
      }
      const jitter = randomInt(0, 100);
      const nextDelay = delayTime + jitter;

      await pause(nextDelay);

      const nextAttempt = attemptsLeft - 1;
      const nextDelayTime = nextDelay * 2;

      return attemptOperation(nextAttempt, nextDelayTime);
    }
  };

  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeout);
  });

  // Ensure the race between timeout and retry operation
  return Promise.race([timeoutPromise, attemptOperation(retries, retryDelay)]);
};

export default withAsync;
