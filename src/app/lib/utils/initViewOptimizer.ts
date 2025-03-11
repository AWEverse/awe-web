import { fastRaf } from "@/lib/core";

const TEST_INTERVAL = 5000; // ms
const FRAMES_TO_TEST = 10;
const REDUCED_FPS_THRESHOLD = 35; // FPS
const HIGH_MEMORY_THRESHOLD = 0.8; // 80% heap
const RESPONSIVENESS_THRESHOLD = 100; // ms

let isOptimized = false;
let healthMetrics = {
  fps: 60,
  memory: 0,
  latency: 0
};

const perf = performance;
const hasMemoryAPI = 'memory' in perf;
const perfMemory = hasMemoryAPI ? (perf as any).memory : null;

const frameTimes = new Float64Array(FRAMES_TO_TEST);
let frameIndex = 0;
const responseChannel = new MessageChannel();
const optimizationElement = document.createElement('div');

optimizationElement.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 100vh;
  transform: translateX(100%);
  transition: transform 0.1s;
  background: transparent;
`;

// Preload WebAssembly module (requires separate compilation)
// const wasmModule = await WebAssembly.instantiateStreaming(...); // [[6]][[8]][[9]]

function startMonitoring(): void {
  if (document.hidden) return;

  const check = () => {
    if (document.hidden) return;

    Promise.all([
      measureFPS(),
      measureMemory(),
      measureResponsiveness()
    ]).then(([fps, mem, resp]) => {
      healthMetrics = { fps, memory: mem, latency: resp };

      if (fps < REDUCED_FPS_THRESHOLD ||
        mem > HIGH_MEMORY_THRESHOLD ||
        resp > RESPONSIVENESS_THRESHOLD) {
        optimizeRendering();
      }
    });

    setTimeout(check, TEST_INTERVAL);
  };

  check();
}

function measureFPS(): Promise<number> {
  return new Promise(resolve => {
    let lastTime = perf.now();
    let count = 0;

    function tick() {
      const now = perf.now();
      frameTimes[frameIndex++ % FRAMES_TO_TEST] = now - lastTime;
      lastTime = now;

      if (++count >= FRAMES_TO_TEST) {
        // Compute average using WebAssembly for critical path [[6]][[9]]
        // const avg = wasmModule.exports.computeAverage(frameTimes);
        const avg = frameTimes.reduce((a, b) => a + b, 0) / FRAMES_TO_TEST;
        resolve(Math.round(1000 / avg));
      } else {
        fastRaf(tick);
      }
    }

    fastRaf(tick);
  });
}

function measureMemory(): number {
  return perfMemory
    ? perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit
    : 0;
}

function measureResponsiveness(): Promise<number> {
  const start = perf.now();
  const { port1, port2 } = responseChannel;

  return new Promise(resolve => {
    port1.addEventListener('message', () => {
      resolve(perf.now() - start);
      port2.close();
    }, true);

    port2.postMessage(null);
  });
}

function optimizeRendering(): void {
  if (isOptimized) return;
  isOptimized = true;

  if (!document.body.contains(optimizationElement)) {
    document.body.appendChild(optimizationElement);
  }

  fastRaf(() => {
    optimizationElement.style.transform = 'translateX(0)';
    optimizationElement.addEventListener('transitionend', () => {
      optimizationElement.style.transform = 'translateX(100%)';
      isOptimized = false;
    }, true);
  });
}

export default function initViewOptimizer() {
  if (!document.hidden) {
    startMonitoring();

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) startMonitoring();
    });
  }
}
