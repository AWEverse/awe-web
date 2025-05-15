import { ComponentType, lazy as reactLazy } from 'react';

// Enhanced lazy loading with retries and timeout
import { LazyExoticComponent } from 'react';

export function lazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  timeout = 10000
): LazyExoticComponent<T> {
  const retryImport = async (attemptsLeft: number): Promise<{ default: T }> => {
    try {
      const importPromise = factory();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Import timeout')), timeout);
      });

      return await Promise.race([importPromise, timeoutPromise]) as { default: T };
    } catch (error) {
      if (attemptsLeft > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return retryImport(attemptsLeft - 1);
      }
      throw error;
    }
  };

  return reactLazy(() => retryImport(retries));
}

// Preload a component without rendering it
export function preloadComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): Promise<void> {
  return factory().then(() => void 0);
}
