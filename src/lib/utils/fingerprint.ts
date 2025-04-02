import { PLATFORM_ENV, SafeLocalStorage } from "../core";

export const FINGERPRINT_CACHE_KEY = "clientFingerprint";

const BASE_FONTS = [
  "Arial",
  "Courier New",
  "Georgia",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Helvetica",
  "Monaco",
  "Comic Sans MS",
  "Impact",
];
const TEST_STRING = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const TEST_SIZE = "72px";
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;
const SALT = "volynets" + Math.random().toString(36).slice(2);

const TEXT_ENCODER = new TextEncoder();
const UINT8_VIEW = new Uint8Array(32);
const AUDIO_BUFFER = new Float32Array(128);

interface ClientFingerprint {
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  features: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  fonts: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  touchSupport: boolean;
  audioFingerprint: string;
  platform: string;
  timingSignature: string;
  behaviorHash: string;
}

async function sha256(str: string): Promise<string> {
  const data = TEXT_ENCODER.encode(SALT + str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  UINT8_VIEW.set(new Uint8Array(hashBuffer));
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += UINT8_VIEW[i].toString(16).padStart(2, "0");
  }
  return result;
}

function detectFonts(ctx: CanvasRenderingContext2D): string {
  ctx.font = `${TEST_SIZE} sans-serif`;
  const baseline = ctx.measureText(TEST_STRING);
  const baselineWidth = baseline.width;
  const baselineHeight =
    baseline.actualBoundingBoxAscent + baseline.actualBoundingBoxDescent;

  let detectedCount = 0;
  const detected = new Array(BASE_FONTS.length);

  for (let i = 0; i < BASE_FONTS.length; i++) {
    ctx.font = `${TEST_SIZE} ${BASE_FONTS[i]}, sans-serif`;
    const metrics = ctx.measureText(TEST_STRING);
    const widthDiff = Math.abs(metrics.width - baselineWidth);
    const heightDiff = Math.abs(
      metrics.actualBoundingBoxAscent +
      metrics.actualBoundingBoxDescent -
      baselineHeight,
    );
    if (widthDiff > 0.1 || heightDiff > 0.1) {
      detected[detectedCount++] = BASE_FONTS[i];
    }
  }

  return detectedCount > 0
    ? detected.slice(0, detectedCount).sort().join(",")
    : "unknown";
}

function detectFeatures(): string {
  const features = [];
  let featureCount = 0;

  const canvas = document.createElement("canvas");
  if (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    features[featureCount++] = "WebGL";
  if (window.AudioContext || (window as any).webkitAudioContext)
    features[featureCount++] = "WebAudio";
  if ("pdfViewerEnabled" in navigator) features[featureCount++] = "PDFViewer";
  if (
    "RTCPeerConnection" in window ||
    "mozRTCPeerConnection" in window ||
    "webkitRTCPeerConnection" in window
  ) {
    features[featureCount++] = "WebRTC";
  }
  if ("bluetooth" in navigator) features[featureCount++] = "Bluetooth";
  if (
    "webkitTemporaryStorage" in navigator ||
    "webkitPersistentStorage" in navigator
  ) {
    features[featureCount++] = "WebkitStorage";
  }

  return featureCount > 0
    ? features.sort().slice(0, featureCount).join(",")
    : "unknown";
}

async function getTimingSignature(): Promise<string> {
  const iterations = 1000;
  const times: number[] = new Array(iterations);

  for (let i = 0; i < iterations; i++) {
    const t = performance.now();
    Math.sin(i);
    times[i] = performance.now() - t;
  }

  const avg = times.reduce((a, b) => a + b, 0) / iterations;
  const variance = times.reduce((a, b) => a + (b - avg) ** 2, 0) / iterations;
  return sha256(`${avg.toFixed(6)}|${variance.toFixed(6)}`);
}

async function getBehaviorHash(): Promise<string> {
  let entropy = "";
  const start = performance.now();

  const dummyEvent = () => {
    const now = performance.now();
    entropy += now.toString(36);
  };

  window.addEventListener("mousemove", dummyEvent, { once: true });
  window.addEventListener("touchmove", dummyEvent, { once: true });
  await new Promise((resolve) => setTimeout(resolve, 50));

  entropy += (performance.now() - start).toString(36);
  return sha256(entropy || "no-interaction");
}

export async function collectClientFingerprint(): Promise<ClientFingerprint> {
  let canvasFingerprint = "unknown";
  let webglFingerprint = "unknown";
  let audioFingerprint = "unknown";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx.fillStyle = "rgb(255, 0, 255)";
    ctx.fillRect(10, 10, 100, 100);
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.font = "16px Arial";
    ctx.fillText(SALT + "FingerprintTest", 15, 50);
    ctx.beginPath();
    ctx.arc(50, 50, 20, 0, Math.PI * 2, true);
    ctx.stroke();
    try {
      canvasFingerprint = await sha256(
        canvas.toDataURL() + navigator.userAgent,
      );
    } catch (e) {
      console.warn("Canvas fingerprinting failed:", e);
    }
  }

  const gl = (canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext;
  if (gl) {
    try {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const vendor = gl.getParameter(gl.VENDOR);
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
      const shaders = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
      webglFingerprint = await sha256(
        `${vendor}|${renderer}|${gl.getParameter(gl.VERSION)}|${shaders}`,
      );
    } catch (e) {
      console.warn("WebGL fingerprinting failed:", e);
    }
  }

  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (AudioContext) {
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const analyser = audioCtx.createAnalyser();
      const gain = audioCtx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(
        440 + Math.random() * 10,
        audioCtx.currentTime,
      );
      analyser.fftSize = 2048;
      gain.gain.setValueAtTime(0, audioCtx.currentTime);

      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(audioCtx.destination);

      oscillator.start();
      analyser.getFloatFrequencyData(AUDIO_BUFFER);
      oscillator.stop();

      let audioData = "";
      for (let i = 0; i < 128; i++) audioData += AUDIO_BUFFER[i].toFixed(2);
      audioFingerprint = await sha256(audioData + SALT);

      await audioCtx.close();
    } catch (e) {
      console.warn("Audio fingerprinting failed:", e);
    }
  }

  const timingSignature = await getTimingSignature();
  const behaviorHash = await getBehaviorHash();

  return {
    screenResolution: `${window.screen.width}x${window.screen.height}x${window.screen.availWidth}x${window.screen.availHeight}`, // More screen data
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    colorDepth: window.screen.colorDepth | 0,
    features: detectFeatures(),
    canvasFingerprint,
    webglFingerprint,
    fonts: ctx ? detectFonts(ctx) : "unknown",
    hardwareConcurrency: navigator.hardwareConcurrency | 0,
    deviceMemory: (navigator as any).deviceMemory | 0,
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    audioFingerprint,
    platform: PLATFORM_ENV || navigator.platform || "unknown",
    timingSignature,
    behaviorHash,
  };
}

export function getCachedClientFingerprint(): ClientFingerprint | null {
  const cachedFingerprint = SafeLocalStorage.getItem<string | null>(
    FINGERPRINT_CACHE_KEY,
  );
  if (!cachedFingerprint) return null;

  try {
    return JSON.parse(cachedFingerprint);
  } catch (e) {
    console.warn("Failed to parse cached fingerprint:", e);
    return null;
  }
}
