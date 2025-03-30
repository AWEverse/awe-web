import { SafeLocalStorage } from "@/lib/core";
import { collectClientFingerprint, FINGERPRINT_CACHE_KEY } from "@/lib/utils/fingerprint";

export default async function (): Promise<void> {
  const cachedFingerprint = SafeLocalStorage.getItem<string | null>(FINGERPRINT_CACHE_KEY);

  if (cachedFingerprint) {
    try {
      const parsed = JSON.parse(cachedFingerprint);
      return parsed;
    } catch (e) {
      console.warn('Failed to parse cached fingerprint:', e);
    }
  }

  const fingerprint = await collectClientFingerprint();

  SafeLocalStorage.setItem(FINGERPRINT_CACHE_KEY, JSON.stringify(fingerprint));
}
