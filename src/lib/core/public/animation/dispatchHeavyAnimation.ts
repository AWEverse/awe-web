import { requestIdleExecution, throttleWith } from "../schedulers";
import { signal } from "../signals";

const AUTO_END_TIMEOUT = 1000;

const animationState = {
  count: 0,
  isActive: signal(false),
};

const blockingAnimationState = {
  count: 0,
  isActive: signal(false),
};

export const getIsHeavyAnimating = animationState.isActive;
export const getIsBlockingHeavyAnimating = blockingAnimationState.isActive;

export function dispatchHeavyAnimation(
  duration = AUTO_END_TIMEOUT,
  isBlocking = false,
) {
  const state = isBlocking ? blockingAnimationState : animationState;

  state.count++;
  state.isActive.value = true;

  const timeout = setTimeout(() => {
    state.count = Math.max(0, state.count - 1);
    state.isActive.value = state.count > 0;
  }, duration);

  return () => {
    clearTimeout(timeout);
    state.count = Math.max(0, state.count - 1);
    state.isActive.value = state.count > 0;
  };
}

export function onIdleComplete(callback: NoneToVoidFunction) {
  const checkIdle = () => {
    requestIdleExecution(() => {
      if (!animationState.isActive.value) callback();
      else requestAnimationFrame(checkIdle);
    });
  };

  checkIdle();
}

export const throttleWithIdleComplete = <F extends AnyToVoidFunction>(fn: F) =>
  throttleWith(onIdleComplete, fn);

// This code provides a mechanism to track and manage heavy animations, allowing efficient scheduling of tasks during idle periods. Here's an optimized version with explanations and use cases:

// Key Optimizations:
// 1. State encapsulation using objects for better maintainability
// 2. Safer state updates with `Math.max(0, ...)` to prevent negative counts
// 3. Immediate state cleanup in returned cancel callback
// 4. Simplified idle checking flow

// Common Use Cases:

// 1. Tracking Complex Animations
// ```typescript
// // Component initiating animation
// function startLoader() {
//   const cleanup = dispatchHeavyAnimation(2000, true);

//   // Run after animation completes
//   onIdleComplete(() => {
//     console.log('Safe to perform layout calculations now');
//   });

//   return cleanup; // Call this if animation completes early
// }
// ```

// 2. Blocking UI Interactions
// ```typescript
// // Prevent form submission during animation
// watchEffect(() => {
//   if (getIsBlockingHeavyAnimating.value) {
//     disableForm();
//   } else {
//     enableForm();
//   }
// });
// ```

// 3. Optimized Scroll Handlers
// ```typescript
// const handleScroll = throttleWithIdleComplete((event) => {
//   // Heavy calculations that should wait for animations
//   calculateVisibleElements();
// });

// window.addEventListener('scroll', handleScroll);
// ```

// 4. Resource-Intensive Operations
// ```typescript
// function loadHeavyContent() {
//   const cleanup = dispatchHeavyAnimation(3000);

//   fetchContent().then(data => {
//     onIdleComplete(() => {
//       renderComplexVisualization(data);
//     });
//   }).finally(cleanup);
// }
// ```

// Best Practices:
// 1. Always call the cleanup function from `dispatchHeavyAnimation`
// 2. Use blocking animations sparingly for critical UI transitions
// 3. Combine with CSS `will-change` for actual animation optimization
// 4. Use `throttleWithIdleComplete` for performance-sensitive handlers

// When to Use:
// - Complex SVG animations
// - Canvas-based visualizations
// - Page transition animations
// - Bulk DOM operations
// - Heavy data visualization rendering

// This pattern helps coordinate JavaScript execution with visual updates,
// preventing jank and improving perceived performance by strategically
// delaying non-critical operations until animations complete.
