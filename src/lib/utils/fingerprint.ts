export const FP_CACHE_KEY = "tinyFP";

const fnv1a = (str: string) => {
  let h = 2166136261 >>> 0;

  for (let i = 0; i < str.length; i++) {
    h = (h ^ str.charCodeAt(i)) * 16777619 >>> 0;
  }

  return h.toString(36).padStart(6, "0");
};

const collectTinyFingerprint = () => {
  const { screen, navigator } = window;
  const props = {
    scr: `${screen.width}x${screen.height}`,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unk",
    lng: navigator.language ?? (navigator as any).userLanguage ?? "unk",
    ent: (Date.now() % 1e3).toString(36),
  };

  const raw = `${props.scr}|${props.tz}|${props.lng}|${props.ent}`;
  const id = fnv1a(raw);

  const fingerprint = { id, p: props }; // Compact structure

  queueMicrotask(() => {
    try {
      localStorage.setItem(FP_CACHE_KEY, JSON.stringify(fingerprint));
    } catch {
      // Silent fail (e.g., storage disabled)
    }
  });

  return fingerprint;
};

const getCachedTinyFingerprint = () => {
  try {
    const cached = localStorage.getItem(FP_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const getFingerprint = () => getCachedTinyFingerprint() ?? collectTinyFingerprint();

