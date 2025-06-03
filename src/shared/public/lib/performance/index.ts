import { initializePerformance } from './config';
import ResourceMonitor from './monitor';
import { preloadComponent } from './lazy';
import { clearCaches } from './cache';

/**
 * Initialize all performance optimizations
 */
export const initializeOptimizations = () => {
  // Initialize performance configurations
  initializePerformance();

  // Start resource monitoring
  const monitor = ResourceMonitor.getInstance();
  monitor.start();

  // Set up event listeners for performance optimization
  window.addEventListener('load', () => {
    // Preload critical components after initial load
    requestIdleCallback(() => {
      preloadCriticalComponents();
    });

    // Clear caches periodically
    setInterval(() => {
      clearCaches();
    }, 3600000); // Clear every hour
  });

  // Listen for network changes
  if ('connection' in navigator) {
    (navigator as any).connection.addEventListener('change', () => {
      updateNetworkBasedOptimizations();
    });
  }

  // Listen for memory pressure
  if ('onmemorypressure' in window) {
    window.addEventListener('memorypressure', () => {
      handleMemoryPressure();
    });
  }

  // Set up performance marks for key user interactions
  observeInteractions();
};

/**
 * Preload critical components
 */
const preloadCriticalComponents = async () => {
  // Add your critical components here
  const criticalComponents: never[] = [
    // Example: () => import('@/components/Header')
  ];

  for (const component of criticalComponents) {
    await preloadComponent(component);
  }
};

/**
 * Update optimizations based on network conditions
 */
const updateNetworkBasedOptimizations = () => {
  const connection = (navigator as any).connection;
  const isSlowConnection = connection.saveData ||
    ['slow-2g', '2g'].includes(connection.effectiveType);

  if (isSlowConnection) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
};

/**
 * Handle memory pressure events
 */
const handleMemoryPressure = () => {
  clearCaches();
  ResourceMonitor.getInstance().clearMetrics();
  document.body.classList.add('reduced-motion');
};

/**
 * Observe user interactions for performance tracking
 */
const observeInteractions = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 100) {
        console.warn(`Slow interaction detected: ${entry.name} took ${entry.duration}ms`);
      }
    });
  });

  observer.observe({ entryTypes: ['first-input', 'event'] });
};

// Export performance utilities
export * from './config';
export * from './lazy';
export * from './cache';
export { default as ResourceMonitor } from './monitor';
