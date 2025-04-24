// Utility function to add event listeners efficiently
function addEventListenerOnce(
  element: EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
) {
  element.addEventListener(event, handler, { once: true });
}

/**
 * Patches an HTMLAudioElement to address Safari's progressive audio loading issue,
 * where audio may fail to play correctly due to incomplete buffering.
 * This function ensures the audio plays by temporarily seeking
 * to the end during buffering and restoring the original time afterward.
 * It uses dataset flags to track patching status and avoid redundant operations.
 *
 * @param audioEl - The HTMLAudioElement to patch.
 * @returns void
 *
 * @remarks
 * - Only applies the patch if not previously patched (checked via `dataset.patchedForSafari`).
 * - Temporarily sets `dataset.patchForSafariInProgress` during the patching process.
 * - Restores the original playback time after patching.
 * - Automatically replays the audio if it was paused, unless `dataset.preventPlayAfterPatch` is set.
 * - Uses `addEventListenerOnce` to ensure event listeners are executed only once, improving performance.
 */
export function patchSafariProgressiveAudio(audioEl: HTMLAudioElement) {
  if (audioEl.dataset.patchedForSafari) {
    return; // Early return if already patched
  }

  const { dataset } = audioEl;

  // Set patched flag to prevent repeated patching
  dataset.patchedForSafari = "true";

  // Add 'play' event listener to handle patching process
  addEventListenerOnce(audioEl, "play", () => {
    const currentTime = audioEl.currentTime;
    dataset.patchForSafariInProgress = "true"; // Indicate patching is in progress

    // Handle progress event to finalize the patch
    const onProgress = () => {
      if (!audioEl.buffered.length) return;

      // Set the current time to the end of the audio
      audioEl.currentTime = audioEl.duration - 1;

      // Add 'progress' event listener to finalize the patch once
      addEventListenerOnce(audioEl, "progress", () => {
        delete dataset.patchForSafariInProgress; // Clean up the patch flag
        audioEl.currentTime = currentTime; // Restore the original time

        // If the audio is paused, play it again unless prevented by the flag
        if (audioEl.paused && !dataset.preventPlayAfterPatch) {
          audioEl.play();
        }
      });

      audioEl.removeEventListener("progress", onProgress); // Remove the temporary handler
    };

    audioEl.addEventListener("progress", onProgress);
  });
}

export function isSafariPatchInProgress(audioEl: HTMLAudioElement) {
  return Boolean(audioEl.dataset.patchForSafariInProgress);
}
