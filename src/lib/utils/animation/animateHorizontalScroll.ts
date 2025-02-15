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

// Default damping factor for critically damped spring
const DEFAULT_DAMPING = 4.6;

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
 * @param options - Optional configuration for the animation:
 *   - duration: The animation duration in milliseconds (default: 300).
 *   - damping: Controls the damping ratio of the spring (default: 4.6).
 * @returns A promise that resolves when the animation completes (or is cancelled).
 */
export default function animateHorizontalScroll(
  container: HTMLElement,
  targetLeft: number,
  options: {
    duration?: number;
    damping?: number;
  } = {},
): Promise<void> {
  cancelOngoingAnimation(container);

  const { duration = 300, damping = DEFAULT_DAMPING } = options;

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

    /**
     * Physics-based spring easing function normalized to [0, 1].
     * Formula: e(t) = (1 - (1 + k*t) * exp(-k*t)) / (1 - (1 + k) * exp(-k))
     * where k = damping.
     */
    const springEase = (t: number): number => {
      const numerator = 1 - (1 + damping * t) * Math.exp(-damping * t);
      const denominator = 1 - (1 + damping) * Math.exp(-damping);
      return numerator / denominator;
    };

    const step = (currentTime: number) => {
      if (token.cancelled) {
        resolve();
        return;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);
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
