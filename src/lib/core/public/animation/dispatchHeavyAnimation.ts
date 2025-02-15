import { requestIdleExecution, throttleWith } from "../schedulers";
import { ReadonlySignal, signal } from "../signals";

const AUTO_END_TIMEOUT = 1000;

const animationState = {
  count: 0,
  isActive: signal(false),
};

const blockingAnimationState = {
  count: 0,
  isActive: signal(false),
};

export const getIsHeavyAnimating: ReadonlySignal<boolean> =
  animationState.isActive;

export const getIsBlockingHeavyAnimating: ReadonlySignal<boolean> =
  blockingAnimationState.isActive;

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

// // This code provides a mechanism to track and manage heavy animations, allowing efficient scheduling of tasks during idle periods. Here's an optimized version with explanations and use cases:

// Here are practical real-world use cases for this animation coordination system across different application domains:

// ### 1. E-commerce Product Carousel
// **Scenario:** Smooth image transitions with zoom effects while loading product details
// ```typescript
// const showProductDetails = (productId: string) => {
//   // Start blocking animation during transition
//   const cleanup = dispatchHeavyAnimation(500, true);

//   // Animate carousel transition
//   animateCarousel(productId, () => {
//     // Load heavy product data after animation
//     onIdleComplete(() => {
//       load3DProductView(productId);
//       loadCustomerReviews(productId);
//     });
//   });

//   return cleanup;
// };
// ```

// ### 2. Financial Trading Dashboard
// **Scenario:** Real-time candle stick chart updates without blocking price alerts
// ```typescript
// const handleMarketDataUpdate = throttleWithIdleComplete((update) => {
//   if (!getIsBlockingHeavyAnimating.value) {
//     updateCandlestickChart(update);
//     renderOrderBook(update);
//   } else {
//     queueMicrotask(() => handleMarketDataUpdate(update));
//   }
// });

// // Connect to WebSocket feed
// marketDataFeed.on('update', handleMarketDataUpdate);
// ```

// ### 3. Video Editing Timeline
// **Scenario:** Smooth scrubbing preview with frame-accurate seeking
// ```typescript
// let animationCleanup: () => void;

// const handleTimelineDrag = (position: number) => {
//   // Cancel previous animation tracking
//   animationCleanup?.();

//   // Start new animation session
//   animationCleanup = dispatchHeavyAnimation(300);

//   // Preview update
//   requestAnimationFrame(() => {
//     updateVideoPreview(position);
//     renderTimelineMarkers(position);
//   });
// };

// const handleDragEnd = () => {
//   animationCleanup();
//   onIdleComplete(() => {
//     commitTimelineChanges();
//     generateOptimizedThumbnails();
//   });
// };
// ```

// ### 4. Medical Imaging Viewer
// **Scenario:** Cross-section animations in MRI scan analysis
// ```typescript
// const rotateScanView = (angle: number) => {
//   const cleanup = dispatchHeavyAnimation(1000);

//   animateScanRotation(angle, {
//     onFrame: (progress) => {
//       updateDensityMap(progress);
//       renderMeasurementGuides();
//     },
//     onComplete: () => {
//       onIdleComplete(() => {
//         calculateVolumetricData();
//         updateDiagnosticOverlay();
//       });
//     }
//   });

//   return cleanup;
// };
// ```

// ### 5. Game Lobby Interface
// **Scenario:** Character customization with real-time previews
// ```typescript
// const updateCharacterOutfit = (newItems: WardrobeItem[]) => {
//   const cleanup = dispatchHeavyAnimation(800, true);

//   // Immediate visual update
//   applyCharacterTextures(newItems);

//   // Defer heavy computations
//   onIdleComplete(() => {
//     generateOutfitHash();
//     validateEquipmentCombination();
//     updateInventorySystem();
//   });

//   return () => {
//     cleanup();
//     revertPreviewChanges();
//   };
// };
// ```

// ### 6. Collaborative Whiteboard
// **Scenario:** Multi-user cursor tracking with path prediction
// ```typescript
// const handleRemoteCursorUpdate = throttleWithIdleComplete((update) => {
//   if (getIsHeavyAnimating.value) {
//     bufferCursorUpdates(update);
//     return;
//   }

//   animateCursorMovement(update, {
//     onRender: () => dispatchHeavyAnimation(200),
//     onComplete: () => {
//       processBufferedUpdates();
//       updateCollaborationHistory();
//     }
//   });
// });
// ```

// **Key Benefits Across Use Cases:**
// 1. Maintains 60fps animations during critical interactions
// 2. Batches non-visual computations (data processing, network calls)
// 3. Prioritizes user-perceived performance metrics
// 4. Coordinates complex interaction sequences
// 5. Prevents competing resource contention
// 6. Enables smooth interruptible transitions

// **Performance Critical Paths:**
// - **First Input Delay:** Blocking animations prevent UI lockups
// - **Cumulative Layout Shift:** Coordinated updates stabilize layout
// - **Interaction-to-Visual Response:** Guaranteed animation frames
// - **Main Thread Work:** Offloads tasks to idle periods

// These patterns work particularly well for applications requiring:
// - Real-time visual feedback (design tools, games)
// - Complex data visualization (analytics, dashboards)
// - Media-intensive interfaces (video, 3D viewers)
// - Collaborative environments (whiteboards, docs)
// - Resource-constrained platforms (mobile web, embedded)

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
