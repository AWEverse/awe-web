/**
 * Resource monitor to track performance metrics
 */

type Metric = {
  name: string;
  value: number;
  timestamp: number;
};

class ResourceMonitor {
  private static instance: ResourceMonitor;
  private metrics: Metric[] = [];
  private readonly maxMetrics = 1000;
  private isMonitoring = false;

  private constructor() {
    this.setupObservers();
  }

  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }

  private setupObservers() {
    // Performance Observer for various metrics
    if ('PerformanceObserver' in window) {
      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.addMetric(entry.name, entry.startTime);
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.addMetric('layoutShift', entry.value);
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.addMetric('longTask', entry.duration);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.addMetric(`resource-${entry.name}`, entry.duration);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }

    // Monitor memory if available
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.addMetric('jsHeapSize', memory.usedJSHeapSize);
      }, 10000);
    }

    // Monitor frame rate
    let lastTime = performance.now();
    const measureFrameRate = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      if (delta > 0) {
        this.addMetric('fps', 1000 / delta);
      }
      lastTime = currentTime;
      requestAnimationFrame(measureFrameRate);
    };
    requestAnimationFrame(measureFrameRate);
  }

  private addMetric(name: string, value: number) {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep metrics array size under control
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    this.analyzeMetric(metric);
  }

  private analyzeMetric(metric: Metric) {
    // Analyze FPS drops
    if (metric.name === 'fps' && metric.value < 30) {
      console.warn(`Low FPS detected: ${metric.value}`);
    }

    // Analyze layout shifts
    if (metric.name === 'layoutShift' && metric.value > 0.1) {
      console.warn(`Significant layout shift detected: ${metric.value}`);
    }

    // Analyze long tasks
    if (metric.name === 'longTask' && metric.value > 50) {
      console.warn(`Long task detected: ${metric.value}ms`);
    }

    // Analyze memory usage
    if (metric.name === 'jsHeapSize') {
      const heapLimit = (performance as any).memory?.jsHeapSizeLimit;
      if (heapLimit && metric.value > heapLimit * 0.9) {
        console.warn(`High memory usage: ${Math.round(metric.value / 1024 / 1024)}MB`);
      }
    }
  }

  getMetrics(name?: string, duration = 60000): Metric[] {
    const now = Date.now();
    return this.metrics
      .filter(m =>
        (!name || m.name === name) &&
        (now - m.timestamp) <= duration
      );
  }

  getAverageMetric(name: string, duration = 60000): number {
    const metrics = this.getMetrics(name, duration);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  start() {
    this.isMonitoring = true;
    console.log('Resource monitoring started');
  }

  stop() {
    this.isMonitoring = false;
    console.log('Resource monitoring stopped');
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export default ResourceMonitor;
