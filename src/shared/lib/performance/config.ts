import { OptimizationLevel } from '@/lib/core/private/optimizations/OptimizationLevel';

interface PerformanceConfig {
  optimizationLevel: OptimizationLevel;
  enableAnimations: boolean;
  enableTransitions: boolean;
  lazyLoadImages: boolean;
  cacheDuration: number;
  compressionLevel: number;
}

// Default performance configuration
const defaultConfig: PerformanceConfig = {
  optimizationLevel: OptimizationLevel.Moderate,
  enableAnimations: true,
  enableTransitions: true,
  lazyLoadImages: true,
  cacheDuration: 300000, // 5 minutes
  compressionLevel: 9,
};

let currentConfig: PerformanceConfig = { ...defaultConfig };

// Detect device capabilities
const isLowEndDevice = () => {
  return !matchMedia('(min-device-memory: 4gb)').matches ||
    !matchMedia('(min-resolution: 2dppx)').matches;
};

// Detect network conditions
const isSlowNetwork = () => {
  const connection = (navigator as any).connection;
  return connection && (
    connection.saveData ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g'
  );
};

// Update configuration based on device/network capabilities
const updateConfigBasedOnCapabilities = () => {
  if (isLowEndDevice() || isSlowNetwork()) {
    currentConfig = {
      ...currentConfig,
      optimizationLevel: OptimizationLevel.High,
      enableAnimations: false,
      enableTransitions: false,
      lazyLoadImages: true,
      compressionLevel: 9,
    };
  }
};

// Initialize performance optimizations
export const initializePerformance = () => {
  updateConfigBasedOnCapabilities();

  // Set up performance observers
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn(`Long task detected: ${entry.name} took ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask', 'resource'] });
  }

  // Apply initial optimizations
  applyOptimizations();
};

// Apply performance optimizations
export const applyOptimizations = () => {
  // Apply CSS optimizations
  document.documentElement.style.setProperty(
    '--animation-duration',
    currentConfig.enableAnimations ? '0.3s' : '0s'
  );

  // Set compression level for data transfers
  if (window.CompressionStream) {
    const compressionStream = new CompressionStream('gzip');
  }

  // Optimize image loading
  if (currentConfig.lazyLoadImages) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if ('loading' in HTMLImageElement.prototype) {
        img.setAttribute('loading', 'lazy');
      }
      img.setAttribute('decoding', 'async');
    });
  }
};

// Update performance configuration
export const updatePerformanceConfig = (config: Partial<PerformanceConfig>) => {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  applyOptimizations();
};

// Get current performance configuration
export const getPerformanceConfig = (): PerformanceConfig => {
  return { ...currentConfig };
};

// Export configuration interface
export type { PerformanceConfig };
