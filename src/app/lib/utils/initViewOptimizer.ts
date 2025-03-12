import { DEBUG } from "@/lib/config/dev";
import { fastRaf } from "@/lib/core";

const DEFAULT_TEST_INTERVAL = 5000;
const FRAMES_TO_TEST = 30;
const REDUCED_FPS_THRESHOLD = 35;
const HIGH_MEMORY_THRESHOLD = 0.8;
const RESPONSIVENESS_THRESHOLD = 50;

let isOptimized = false;
let lastOptimization = 0;
let healthMetrics = { fps: 60, memory: 0, latency: 0 };

const perf = performance;
const hasMemoryAPI = "memory" in perf;
const perfMemory = hasMemoryAPI ? (perf as any).memory : null;

const frameTimes = new Float64Array(FRAMES_TO_TEST);
let frameIndex = 0;
const responseChannel = new MessageChannel();
const optimizationElement = document.createElement("div");

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

function startMonitoring(): void {
  if (document.hidden) return;
  let currentInterval = DEFAULT_TEST_INTERVAL;

  const check = () => {
    if (document.hidden) return;

    Promise.all([measureFPS(), measureMemory(), measureResponsiveness()]).then(
      ([fps, mem, resp]) => {
        healthMetrics = { fps, memory: mem, latency: resp };
        if (DEBUG) console.log("Metrics:", healthMetrics);
        currentInterval = fps < 20 ? 10000 : DEFAULT_TEST_INTERVAL;

        const shouldOptimize =
          (fps < REDUCED_FPS_THRESHOLD || resp > RESPONSIVENESS_THRESHOLD) ||
          (hasMemoryAPI && mem > HIGH_MEMORY_THRESHOLD);

        if (shouldOptimize) {
          if (DEBUG) console.log(`Optimizing: FPS=${fps}, Memory=${mem}, Latency=${resp}`);
          optimizeRendering();
        }
        setTimeout(check, currentInterval);
      }
    );
  };

  check();
}

function measureFPS(): Promise<number> {
  return new Promise((resolve) => {
    let lastTime = perf.now();
    let count = 0;

    function tick() {
      const now = perf.now();
      frameTimes[frameIndex++ % FRAMES_TO_TEST] = now - lastTime;
      lastTime = now;
      if (++count >= FRAMES_TO_TEST) {
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
  if (!perfMemory) {
    if (DEBUG) console.warn("performance.memory not supported; memory optimization disabled.");
    return 0;
  }
  return perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit;
}

function measureResponsiveness(): Promise<number> {
  const start = perf.now();
  const { port1, port2 } = responseChannel;
  return new Promise((resolve) => {
    port1.addEventListener(
      "message",
      () => {
        const latency = perf.now() - start;
        if (DEBUG) console.log(`Latency: ${latency}ms`);
        resolve(latency);
        port2.close();
      },
      { once: true }
    );
    port2.postMessage(null);
  });
}

function optimizeRendering(): void {
  const now = perf.now();
  const COOLDOWN = 10000; // 10s
  if (isOptimized || now - lastOptimization < COOLDOWN) return;
  isOptimized = true;
  lastOptimization = now;

  if (!document.body.contains(optimizationElement)) {
    document.body.appendChild(optimizationElement);
  }

  fastRaf(() => {
    optimizationElement.style.transform = "translateX(0)";
    optimizationElement.addEventListener(
      "transitionend",
      () => {
        optimizationElement.style.transform = "translateX(100%)";
        isOptimized = false;
      },
      { once: true }
    );
  });
}

export default function initViewOptimizer() {
  if (!document.hidden) {
    startMonitoring();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) startMonitoring();
    });
  }
}
