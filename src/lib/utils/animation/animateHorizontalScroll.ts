/**
 * A WeakMap to track any ongoing animations for a container.
 * The key is the container, and the value is a token indicating if the animation was cancelled.
 */
const ongoingAnimations = new WeakMap<HTMLElement, { cancelled: boolean }>();

/**
 * Cancels any ongoing horizontal scroll animation on the container.
 *
 * @param container - The HTMLElement whose animation should be cancelled.
 */
function cancelOngoingAnimation(container: HTMLElement): void {
  const token = ongoingAnimations.get(container);

  if (token) {
    token.cancelled = true;
    ongoingAnimations.delete(container);
  }
}

// k controls the spring's response; k ~ 4.6 produces a smooth yet prompt transition.
const k = 4.6;

/**
 * Smoothly animates the horizontal scroll of a container to a target position
 * using a physics-based critically damped spring easing.
 *
 * The easing function is defined as:
 *   e(t) = (1 - (1 + k*t) * exp(-k*t)) / (1 - (1 + k) * exp(-k))
 *
 * where:
 * - t is the normalized time (0 <= t <= 1)
 * - k is a constant (recommended ~4.6) that controls the stiffness/damping.
 *
 * @param container - The HTMLElement whose scroll position will be animated.
 * @param targetLeft - The desired final scrollLeft value.
 * @param duration - The animation duration in milliseconds (default: 300).
 * @returns A promise that resolves when the animation completes (or is cancelled).
 */
export default function animateHorizontalScroll(
  container: HTMLElement,
  targetLeft: number,
  duration = 150,
): Promise<void> {
  cancelOngoingAnimation(container);

  // no need for fastdom remaining scrollLeft attr cause already in microtasks
  return new Promise((resolve) => {
    const startLeft = container.scrollLeft;
    const change = targetLeft - startLeft;

    if (change === 0 || duration <= 0) {
      container.scrollLeft = targetLeft;
      resolve();
      return;
    }

    const startTime = performance.now();
    const token = { cancelled: false };
    ongoingAnimations.set(container, token);

    // Critically damped spring easing function normalized to [0,1]
    // springEase(t) = (1 - (1 + k*t) * exp(-k*t)) / (1 - (1 + k) * exp(-k))
    const springEase = (t: number): number => {
      const numerator = 1 - (1 + k * t) * Math.exp(-k * t);
      const denominator = 1 - (1 + k) * Math.exp(-k);
      return numerator / denominator;
    };

    const step = (currentTime: number) => {
      if (token.cancelled) {
        resolve();
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = springEase(progress);

      container.scrollLeft = startLeft + change * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        ongoingAnimations.delete(container);
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
}
