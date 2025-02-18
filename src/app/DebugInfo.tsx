import React, { useEffect, useState } from "react";

const DebugInfo = () => {
  // Performance metrics
  const [fps, setFps] = useState(0);
  const [eventLoopDelay, setEventLoopDelay] = useState(0);
  interface MemoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  }

  const [memory, setMemory] = useState<MemoryInfo | null>(null);

  // Async Health Checker state: API health and network status.
  const [health, setHealth] = useState({
    api: "Unknown",
    network: navigator.onLine ? "Online" : "Offline",
    lastChecked: "",
  });

  // FPS measurement using requestAnimationFrame
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId = 0;

    const updateFps = () => {
      frameCount++;
      const now = performance.now();
      if (now > lastTime + 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(updateFps);
    };

    updateFps();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Event loop delay measurement using recursive setTimeout
  useEffect(() => {
    let isMounted = true;
    const measureDelay = () => {
      const start = performance.now();
      setTimeout(() => {
        if (!isMounted) return;
        const delay = performance.now() - start;
        setEventLoopDelay(delay);
        measureDelay();
      }, 0);
    };
    measureDelay();
    return () => {
      isMounted = false;
    };
  }, []);

  // Memory measurement (works in supported browsers like Chrome)
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ((performance as any).memory) {
        setMemory({
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        });
      }
    };
    const memInterval = setInterval(updateMemoryInfo, 1000);
    return () => clearInterval(memInterval);
  }, []);

  // Asynchronous API health check: periodically ping a /health endpoint.
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch("/health");
        if (response.ok) {
          setHealth((prev) => ({
            ...prev,
            api: "Healthy",
            lastChecked: new Date().toLocaleTimeString(),
          }));
        } else {
          setHealth((prev) => ({
            ...prev,
            api: "Unhealthy",
            lastChecked: new Date().toLocaleTimeString(),
          }));
        }
      } catch (error) {
        setHealth((prev) => ({
          ...prev,
          api: "Unhealthy",
          lastChecked: new Date().toLocaleTimeString(),
        }));
      }
    };

    // Run immediately and then every 5 seconds.
    checkApiHealth();
    const intervalId = setInterval(checkApiHealth, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Listen to online/offline events to update network status.
  useEffect(() => {
    const updateNetworkStatus = () => {
      setHealth((prev) => ({
        ...prev,
        network: navigator.onLine ? "Online" : "Offline",
      }));
    };
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,

        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "10px",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      <div>
        <strong>FPS:</strong> {fps}
      </div>
      <div>
        <strong>Event Loop Delay:</strong> {Math.round(eventLoopDelay)} ms
      </div>
      {memory ? (
        <>
          <div>
            <strong>JS Heap Size Limit:</strong>{" "}
            {formatBytes(memory.jsHeapSizeLimit)}
          </div>
          <div>
            <strong>Total JS Heap Size:</strong>{" "}
            {formatBytes(memory.totalJSHeapSize)}
          </div>
          <div>
            <strong>Used JS Heap Size:</strong>{" "}
            {formatBytes(memory.usedJSHeapSize)}
          </div>
        </>
      ) : (
        <div>Memory info not available</div>
      )}
      <div>
        <strong>Async Health Checker:</strong>
        <ul>
          <li>API: {health.api}</li>
          <li>Network: {health.network}</li>
          <li>Last Checked: {health.lastChecked}</li>
        </ul>
      </div>
    </div>
  );
};

function formatBytes(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export default DebugInfo;
