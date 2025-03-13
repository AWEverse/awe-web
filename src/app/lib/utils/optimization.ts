// view-optimizer.js
import { DEBUG } from "@/lib/config/dev";

// Constants
const DEFAULT_CHECK_INTERVAL = 5000;
const REDUCED_FPS_THRESHOLD = 35;
const HIGH_MEMORY_THRESHOLD = 0.8;
const RESPONSIVENESS_THRESHOLD = 50;
const OPTIMIZATION_COOLDOWN = 10000;

// State
let isOptimized = false;
let lastOptimization = 0;
let healthMetrics = { fps: 60, memory: 0, latency: 0 };
let deferredTasks = new Set();
let optimizationLevel = 0; // 0: none, 1: light, 2: medium, 3: aggressive

// Performance monitoring
const perf = performance;
const hasMemoryAPI = "memory" in perf;
const perfMemory = hasMemoryAPI ? (perf.memory) : null;

// Create monitoring worker
let monitoringWorker;
try {
  // Only create worker if supported
  if (typeof Worker !== 'undefined') {
    const workerBlob = new Blob([`
      // Monitoring Worker
      let lastCheck = 0;

      self.onmessage = function(e) {
        const { command, metrics } = e.data;

        if (command === 'updateMetrics') {
          // Process metrics from main thread
          const now = performance.now();
          const { fps, memory, latency } = metrics;

          // Determine if optimization is needed
          const needsOptimization =
            (fps < ${REDUCED_FPS_THRESHOLD} || latency > ${RESPONSIVENESS_THRESHOLD}) ||
            (memory > ${HIGH_MEMORY_THRESHOLD});

          // Determine optimization level based on severity
          let level = 0;
          if (needsOptimization) {
            if (fps < 20 || memory > 0.9 || latency > 100) {
              level = 3; // Aggressive optimization
            } else if (fps < 30 || memory > 0.85 || latency > 70) {
              level = 2; // Medium optimization
            } else {
              level = 1; // Light optimization
            }
          }

          self.postMessage({
            needsOptimization,
            optimizationLevel: level,
            metrics: { fps, memory, latency }
          });
        }
      };
    `], { type: 'application/javascript' });

    monitoringWorker = new Worker(URL.createObjectURL(workerBlob));

    monitoringWorker.onmessage = (event) => {
      const { needsOptimization, optimizationLevel: level } = event.data;

      if (needsOptimization) {
        optimizeRendering(level);
      }
    };
  }
} catch (err) {
  if (DEBUG) console.warn('Web Worker creation failed:', err);
}

// Initialize observation of heavy components
function setupLazyRendering() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const component = entry.target as HTMLElement;

      if (entry.isIntersecting) {
        if (component.dataset.renderState !== 'active') {
          component.dataset.renderState = 'active';
          if (component.renderComponent && typeof component.renderComponent === 'function') {
            component.renderComponent();
          }
        }
      } else if (isOptimized && optimizationLevel > 1) {
        // Only unrender if we're in medium/aggressive optimization mode
        if (component.dataset.renderState === 'active') {
          component.dataset.renderState = 'inactive';
          if (component.unrenderComponent && typeof component.unrenderComponent === 'function') {
            component.unrenderComponent();
          }
        }
      }
    });
  }, {
    rootMargin: '200px',  // Load before visible
    threshold: 0.01       // Trigger at 1% visibility
  });

  // Observe all heavy components
  document.querySelectorAll('[data-heavy="true"]').forEach(component => {
    observer.observe(component);
  });

  return observer;
}

// Use this for non-critical operations
function scheduleTask(task, priority = 'low') {
  // Use different scheduling strategies based on priority
  if (priority === 'high') {
    // High priority: run soon but still async
    const taskId = setTimeout(task, 0);
    return taskId;
  } else if (priority === 'medium') {
    // Medium priority: use requestAnimationFrame
    const taskId = requestAnimationFrame(() => task());
    return taskId;
  } else {
    // Low priority: use requestIdleCallback with timeout
    if ('requestIdleCallback' in window) {
      const taskId = requestIdleCallback(
        (deadline) => {
          if (deadline.timeRemaining() > 5 || deadline.didTimeout) {
            task();
          } else {
            // Retry later
            scheduleTask(task, priority);
          }
        },
        { timeout: 2000 }
      );

      const taskObj = { id: taskId, task, priority };
      deferredTasks.add(taskObj);
      return taskId;
    } else {
      // Fallback for browsers without requestIdleCallback
      const taskId = setTimeout(task, 50);
      const taskObj = { id: taskId, task, priority };
      deferredTasks.add(taskObj);
      return taskId;
    }
  }
}

// Cancel a scheduled task
function cancelTask(taskId) {
  // Find and remove the task
  deferredTasks.forEach(taskObj => {
    if (taskObj.id === taskId) {
      if (taskObj.priority === 'low' && 'cancelIdleCallback' in window) {
        cancelIdleCallback(taskId);
      } else if (taskObj.priority === 'medium') {
        cancelAnimationFrame(taskId);
      } else {
        clearTimeout(taskId);
      }
      deferredTasks.delete(taskObj);
    }
  });
}

// More efficient FPS measurement
function measureFPS() {
  return new Promise(resolve => {
    if ('requestAnimationFrame' in window) {
      const frameTimes = [];
      let lastTime = performance.now();
      let frame = 0;
      const MAX_FRAMES = 10; // Fewer frames for faster measurement

      function frameStep() {
        const now = performance.now();
        frameTimes.push(now - lastTime);
        lastTime = now;

        if (++frame < MAX_FRAMES) {
          requestAnimationFrame(frameStep);
        } else {
          // Calculate average FPS
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const fps = Math.min(60, Math.round(1000 / avgFrameTime)); // Cap at 60fps
          resolve(fps);
        }
      }

      requestAnimationFrame(frameStep);
    } else {
      // Fallback if rAF not available
      resolve(60);
    }
  });
}

// Measure memory usage
function measureMemory() {
  return new Promise(resolve => {
    if (perfMemory) {
      resolve(perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit);
    } else {
      // Alternative memory estimation (basic)
      try {
        let objects = 0;
        for (const key in window) {
          objects++;
        }
        // Very crude estimate based on number of global objects
        const memoryEstimate = Math.min(0.7, objects / 10000); // Normalize to 0-1 range
        resolve(memoryEstimate);
      } catch (e) {
        // Default to medium usage if estimation fails
        resolve(0.5);
      }
    }
  });
}

// Measure UI responsiveness/latency
function measureResponsiveness() {
  return new Promise(resolve => {
    const start = performance.now();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Two rAFs to measure how long it takes to respond
        const latency = performance.now() - start;
        resolve(latency);
      });
    });
  });
}

// Collect all performance metrics
async function collectMetrics() {
  try {
    const [fps, memory, latency] = await Promise.all([
      measureFPS(),
      measureMemory(),
      measureResponsiveness()
    ]);

    healthMetrics = { fps, memory, latency };

    if (DEBUG) {
      console.debug("Performance metrics:", healthMetrics);
    }

    // Send metrics to worker for analysis
    if (monitoringWorker) {
      monitoringWorker.postMessage({
        command: 'updateMetrics',
        metrics: healthMetrics
      });
    } else {
      // Direct analysis if worker unavailable
      const needsOptimization =
        (fps < REDUCED_FPS_THRESHOLD || latency > RESPONSIVENESS_THRESHOLD) ||
        (memory > HIGH_MEMORY_THRESHOLD);

      if (needsOptimization) {
        let level = 1;
        if (fps < 20 || memory > 0.9 || latency > 100) {
          level = 3; // Aggressive
        } else if (fps < 30 || memory > 0.85 || latency > 70) {
          level = 2; // Medium
        }

        optimizeRendering(level);
      }
    }

    return healthMetrics;
  } catch (err) {
    if (DEBUG) console.warn('Error collecting metrics:', err);
    return healthMetrics; // Return last known metrics
  }
}

// Optimize rendering based on metrics
function optimizeRendering(level) {
  const now = performance.now();

  // Don't optimize too frequently
  if (now - lastOptimization < OPTIMIZATION_COOLDOWN) {
    return;
  }

  lastOptimization = now;
  isOptimized = true;
  optimizationLevel = level;

  if (DEBUG) {
    console.log(`Applying optimization level ${level}`);
  }

  // Apply different strategies based on optimization level
  switch (level) {
    case 3: // Aggressive optimization
      // Disable animations
      document.body.classList.add('optimize-aggressive');
      // Reduce image quality
      document.querySelectorAll('img:not([data-critical="true"])').forEach(img => {
        if (!img.dataset.originalSrc) {
          img.dataset.originalSrc = img.src;
          if (img.src.includes('?')) {
            img.src = img.src + '&quality=low';
          } else {
            img.src = img.src + '?quality=low';
          }
        }
      });
      // Unload non-critical components
      document.querySelectorAll('[data-heavy="true"]:not([data-critical="true"])').forEach(component => {
        if (component.unrenderComponent && typeof component.unrenderComponent === 'function') {
          component.dataset.renderState = 'inactive';
          component.unrenderComponent();
        }
      });
      // Throttle event listeners
      applyEventThrottling(true);
      // Cancel low-priority tasks
      pruneTaskQueue();
      break;

    case 2: // Medium optimization
      document.body.classList.add('optimize-medium');
      // Reduce animations
      document.querySelectorAll('[data-animated="true"]:not([data-critical="true"])').forEach(el => {
        el.style.animationDuration = '0.1s';
        el.style.transitionDuration = '0.1s';
      });
      // Apply medium event throttling
      applyEventThrottling();
      break;

    case 1: // Light optimization
      document.body.classList.add('optimize-light');
      // Minor CSS adjustments through class
      break;

    default:
      // Remove optimizations
      document.body.classList.remove('optimize-light', 'optimize-medium', 'optimize-aggressive');
      // Restore images
      document.querySelectorAll('img[data-original-src]').forEach(img => {
        img.src = img.dataset.originalSrc;
      });
      // Re-enable animations
      document.querySelectorAll('[data-animated="true"]').forEach(el => {
        el.style.animationDuration = '';
        el.style.transitionDuration = '';
      });
      // Remove event throttling
      applyEventThrottling(false);

      isOptimized = false;
      optimizationLevel = 0;
  }

  // Dispatch event for other components to react
  window.dispatchEvent(new CustomEvent('viewoptimizer:optimizationchange', {
    detail: { level, metrics: healthMetrics }
  }));
}

// Apply event throttling for scroll, resize, mousemove
function applyEventThrottling(aggressive = false) {
  // Store original event handlers if not already stored
  if (!window._originalHandlers) {
    window._originalHandlers = new Map();

    // Save original addEventListener
    if (!window._originalAddEventListener) {
      window._originalAddEventListener = EventTarget.prototype.addEventListener;

      // Override addEventListener to track handlers for throttled events
      EventTarget.prototype.addEventListener = function (type, handler, options) {
        if (['scroll', 'resize', 'mousemove', 'pointermove', 'touchmove'].includes(type)) {
          const throttled = throttle(handler, aggressive ? 100 : 50);
          if (!window._originalHandlers.has(handler)) {
            window._originalHandlers.set(handler, throttled);
          }
          return window._originalAddEventListener.call(this, type, throttled, options);
        }
        return window._originalAddEventListener.call(this, type, handler, options);
      };
    }
  }

  // Remove throttling if disabled
  if (!aggressive && window._originalAddEventListener) {
    EventTarget.prototype.addEventListener = window._originalAddEventListener;
    delete window._originalAddEventListener;
    delete window._originalHandlers;
  }
}

// Throttle function for event handling
function throttle(func, limit) {
  let inThrottle;
  let lastArgs;
  let lastThis;
  let lastTime = 0;

  return function () {
    const now = performance.now();
    const args = arguments;
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      lastTime = now;
      inThrottle = true;
    } else {
      lastArgs = args;
      lastThis = context;

      clearTimeout(inThrottle);
      inThrottle = setTimeout(function () {
        if (now - lastTime >= limit) {
          func.apply(lastThis, lastArgs);
          lastTime = now;
        }
      }, Math.max(limit - (now - lastTime), 0));
    }
  };
}

