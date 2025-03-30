import { PLATFORM_ENV, SafeLocalStorage } from "../core";
import { APPLICATION_PDF } from "./mimeTypes";

export const FINGERPRINT_CACHE_KEY = 'clientFingerprint';

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
}

async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function detectFonts(): string {
  const baseFonts: string[] = [
    'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana',
    'Helvetica', 'Monaco', 'Comic Sans MS', 'Impact'
  ];
  const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const testSize = '72px';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return 'unknown';

  const defaultWidth: Record<string, number> = {};
  const defaultHeight: Record<string, number> = {};
  ctx.font = `${testSize} sans-serif`;
  const baseline = ctx.measureText(testString);

  baseFonts.forEach(font => {
    ctx.font = `${testSize} ${font}, sans-serif`;
    const metrics = ctx.measureText(testString);
    defaultWidth[font] = metrics.width;
    defaultHeight[font] = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  });

  const detectedFonts = baseFonts.filter(font => {
    const widthDiff = Math.abs(defaultWidth[font] - baseline.width);
    const heightDiff = Math.abs(defaultHeight[font] - (baseline.actualBoundingBoxAscent + baseline.actualBoundingBoxDescent));
    return widthDiff > 0.1 || heightDiff > 0.1;
  });

  return detectedFonts.length > 0 ? detectedFonts.sort().join(',') : 'unknown';
}

function detectFeatures(): string {
  const features: string[] = [];

  const canvas = document.createElement('canvas');
  if (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) {
    features.push('WebGL');
  }

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (AudioContext) {
    features.push('WebAudio');
  }

  if ('pdfViewerEnabled' in navigator) {
    features.push('PDFViewer');
  } else {
    const pdfTest = document.createElement('embed');
    pdfTest.type = APPLICATION_PDF;

    if (pdfTest.type === APPLICATION_PDF) {
      features.push('PDFEmbed');
    }
  }

  if ('RTCPeerConnection' in window || 'mozRTCPeerConnection' in window || 'webkitRTCPeerConnection' in window) {
    features.push('WebRTC');
  }

  if ('plugins' in navigator && navigator.plugins && navigator.plugins.length > 0) {
    const pluginNames = Array.from(navigator.plugins)
      .map((p: Plugin) => p.name)
      .filter(name => name && typeof name === 'string');
    features.push(...pluginNames);
  }

  return features.length > 0 ? features.sort().join(',') : 'unknown';
}

export async function collectClientFingerprint(): Promise<ClientFingerprint> {
  let canvasFingerprint: string = 'unknown';
  let webglFingerprint: string = 'unknown';
  let audioFingerprint: string = 'unknown';

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = 'rgb(255, 0, 255)';
      ctx.fillRect(10, 10, 100, 100);
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.font = '16px Arial';
      ctx.fillText('FingerprintTest#$%^@£éú', 15, 50);
      ctx.beginPath();
      ctx.arc(50, 50, 20, 0, Math.PI * 2, true);
      ctx.stroke();
      canvasFingerprint = await sha256(canvas.toDataURL());
    }
  } catch (e) {
    console.warn('Canvas fingerprinting failed:', e);
  }

  try {
    const webglCanvas = document.createElement('canvas');
    const gl = webglCanvas.getContext('webgl') as WebGLRenderingContext | null ||
      webglCanvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = gl.getParameter(gl.VENDOR) as string;
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string
        : gl.getParameter(gl.RENDERER) as string;
      const glData = `${vendor}|${renderer}|${gl.getParameter(gl.VERSION)}`;
      webglFingerprint = await sha256(glData);
    }
  } catch (e) {
    console.warn('WebGL fingerprinting failed:', e);
  }

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

    if (AudioContext) {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      analyser.fftSize = 2048;
      gain.gain.setValueAtTime(0, ctx.currentTime);

      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyser.getFloatFrequencyData(dataArray);
      oscillator.stop();

      const audioData = Array.from(dataArray).slice(0, 100).map(v => v.toFixed(2)).join('');
      audioFingerprint = await sha256(audioData);

      await ctx.close();
    }
  } catch (e) {
    console.warn('Audio fingerprinting failed:', e);
  }

  const fonts = detectFonts();
  const features = detectFeatures();

  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    colorDepth: window.screen.colorDepth || 0,
    features,
    canvasFingerprint,
    webglFingerprint,
    fonts,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    touchSupport: 'ontouchstart' in window || (navigator.maxTouchPoints > 0),
    audioFingerprint,
    platform: PLATFORM_ENV || navigator.platform || 'unknown',
  };
}


export function getCachedClientFingerprint(): ClientFingerprint | null {

  const cachedFingerprint = SafeLocalStorage.getItem<string | null>(FINGERPRINT_CACHE_KEY);
  if (cachedFingerprint) {
    try {
      return JSON.parse(cachedFingerprint);
    } catch (e) {
      console.warn('Failed to parse cached fingerprint:', e);
      return null;
    }
  }

  return null;
}
