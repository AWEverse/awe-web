import { DEBUG } from "@/lib/config/dev";
import { fastRaf } from "@/lib/core";
import StructRecord from "@/lib/core/public/data-structures/public/StructRecord";
import { requestMutation } from "@/lib/modules/fastdom";

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface Performance {
  memory?: PerformanceMemory;
}

// Immutable performance thresholds
const PERF_METRICS = StructRecord.immutable({
  DEFAULT_TEST_INTERVAL: 5000,
  FRAMES_TO_TEST: 60,
  REDUCED_FPS_THRESHOLD: 45,
  HIGH_MEMORY_THRESHOLD: 0.75,
  RESPONSIVENESS_THRESHOLD: 40,
  COOLDOWN: 15000,
}).create();

interface PerfMetrics {
  fps: number;
  memory: number;
  latency: number;
  timestamp: number;
}

type OptimizationStrategy = 'aggressive' | 'balanced' | 'conservative';

declare global {
  interface Window {
    backgroundTaskHandle?: number;
    performanceOptimizer?: {
      getMetrics: () => PerfMetrics[];
      forceOptimization: () => void;
    };
  }
}

class PerformanceOptimizer {
  private isOptimized = false;
  private lastOptimization = 0;
  private metricsHistory: PerfMetrics[] = [];
  private frameTimes = new Float64Array(PERF_METRICS.FRAMES_TO_TEST);
  private frameIndex = 0;
  private strategy: OptimizationStrategy = 'balanced';

  private optimizationElement = Object.assign(document.createElement("div"), {
    style: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '1px',
      height: '100vh',
      transform: 'translateX(100%)',
      transition: 'transform 0.1s',
      background: 'transparent',
      willChange: 'transform',
      pointerEvents: 'none'
    }
  });

  constructor(private debug = DEBUG) {
    this.initialize();
  }

  private initialize(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) this.startMonitoring();
    }, { threshold: 0.01 });

    observer.observe(document.documentElement);

    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  private startMonitoring(): void {
    if (document.hidden) return;

    this.collectMetrics().then(() => {
      requestIdleCallback(() => this.checkPerformance(), { timeout: 1000 });
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.startMonitoring();
    });
  }

  private async collectMetrics(): Promise<void> {
    const [fps, memory, latency] = await Promise.all([
      this.measureFPS(),
      this.measureMemory(),
      this.measureResponsiveness()
    ]);

    const metrics: PerfMetrics = { fps, memory, latency, timestamp: performance.now() };
    this.metricsHistory.push(metrics);

    if (this.debug) {
      console.debug('Performance Metrics:', {
        ...metrics,
        memoryUsage: `${(memory * 100).toFixed(1)}%`
      });
    }
  }

  private checkPerformance(): void {
    const recentMetrics = this.metricsHistory.slice(-3);
    const shouldOptimize = recentMetrics.some(metrics =>
      this.shouldOptimizeBasedOn(metrics)
    );

    if (shouldOptimize && this.canOptimize()) {
      this.optimizeRendering();
      this.applyOptimizationStrategy();
    }

    setTimeout(() => this.checkPerformance(), PERF_METRICS.DEFAULT_TEST_INTERVAL);
  }

  private shouldOptimizeBasedOn(metrics: PerfMetrics): boolean {
    const { fps, memory, latency } = metrics;
    return (
      fps < PERF_METRICS.REDUCED_FPS_THRESHOLD ||
      memory > PERF_METRICS.HIGH_MEMORY_THRESHOLD ||
      latency > PERF_METRICS.RESPONSIVENESS_THRESHOLD
    );
  }

  private canOptimize(): boolean {
    const now = performance.now();
    return !this.isOptimized && now - this.lastOptimization > PERF_METRICS.COOLDOWN;
  }

  private measureFPS(): Promise<number> {
    return new Promise(resolve => {
      let lastTime = performance.now();

      const tick = () => {
        const now = performance.now();
        this.frameTimes[this.frameIndex++ % PERF_METRICS.FRAMES_TO_TEST] = now - lastTime;
        lastTime = now;

        if (this.frameIndex >= PERF_METRICS.FRAMES_TO_TEST) {
          const total = Array.from(this.frameTimes).reduce((sum, time) => sum + time, 0);
          const avg = total / PERF_METRICS.FRAMES_TO_TEST;
          resolve(Math.round(1000 / avg));
        } else {
          fastRaf(tick);
        }
      };

      fastRaf(tick);
    });
  }

  private measureMemory(): number {
    const perfWithMemory = performance as Performance & { memory?: PerformanceMemory };
    if (perfWithMemory.memory && 'jsHeapSizeLimit' in perfWithMemory.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = perfWithMemory.memory;
      return usedJSHeapSize / jsHeapSizeLimit;
    }

    if (this.debug) {
      console.warn('Memory measurement not supported in this environment');
    }
    return 0;
  }

  private measureResponsiveness(): Promise<number> {
    const channel = new MessageChannel();
    return new Promise(resolve => {
      const start = performance.now();

      channel.port1.addEventListener('message', () => {
        const latency = performance.now() - start;
        channel.port1.close();
        resolve(latency);
      }, { once: true });

      channel.port2.postMessage(null);
    });
  }

  public optimizeRendering(): void {
    this.isOptimized = true;
    this.lastOptimization = performance.now();

    if (!document.body.contains(this.optimizationElement)) {
      document.body.appendChild(this.optimizationElement);
    }

    fastRaf(() => {
      this.optimizationElement.style.transform = 'translateX(0)';
      this.optimizationElement.addEventListener(
        'transitionend',
        () => {
          this.optimizationElement.style.transform = 'translateX(100%)';
          this.isOptimized = false;
          this.strategy = 'balanced';
        },
        { once: true }
      );
    });
  }

  private applyOptimizationStrategy(): void {
    const recentMetrics = this.metricsHistory.slice(-5);
    const avgFps = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;

    this.strategy = avgFps < 30 ? 'aggressive' :
      avgFps < 45 ? 'balanced' : 'conservative';

    requestMutation(() => {
      switch (this.strategy) {
        case 'aggressive':
          this.applyAggressiveOptimizations();
          break;
        case 'conservative':
          this.applyConservativeOptimizations();
          break;
        default:
          this.applyBalancedOptimizations();
      }
    })

    if (this.debug) {
      console.log(`Applied ${this.strategy} optimization strategy based on FPS=${avgFps.toFixed(1)}`);
    }
  }

  private applyAggressiveOptimizations(): void {
    document.documentElement.style.setProperty('--quality-level', 'low');
    if (typeof window.backgroundTaskHandle === 'number') {
      cancelIdleCallback(window.backgroundTaskHandle);
    }
    // Optionally disable animations or offload work
    document.body.classList.add('performance-mode-aggressive');
  }

  private applyBalancedOptimizations(): void {
    document.documentElement.style.setProperty('--quality-level', 'medium');
    document.body.classList.remove('performance-mode-aggressive');
    document.body.classList.add('performance-mode-balanced');
  }

  private applyConservativeOptimizations(): void {
    document.documentElement.style.setProperty('--quality-level', 'high');
    document.body.classList.remove('performance-mode-aggressive', 'performance-mode-balanced');
  }

  private cleanup(): void {
    document.body.removeChild(this.optimizationElement);
    this.metricsHistory = [];
    this.frameTimes = new Float64Array(PERF_METRICS.FRAMES_TO_TEST);
    this.frameIndex = 0;
    this.strategy = 'balanced';
    this.isOptimized = false;
  }
}

export default function initViewOptimizer(): PerformanceOptimizer {
  const optimizer = new PerformanceOptimizer();

  if (!window.performanceOptimizer) {
    window.performanceOptimizer = {
      getMetrics: () => [...optimizer['metricsHistory']],
      forceOptimization: () => optimizer.optimizeRendering()
    };
  }

  return optimizer;
}
